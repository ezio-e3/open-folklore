import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth, useLogout } from "../hooks/useAuth";

// Nav structure adapted from the Claude Design "OpenFolklore Landing" mockup
// (Discover/Countries/Languages/Library, search, Sign in/Get started) —
// merged with the app's existing real, functional role-aware links
// (Submit/My Submissions/Moderation Queue/Admin), which the mockup — a
// logged-out marketing view — doesn't show but the app needs regardless.
// "Library" maps to My Submissions rather than being a separate page.
//
// Mobile: below `md`, the full link list doesn't fit in one row (found by
// actually measuring it — the nav was 607px wide on a 375px viewport,
// forcing the whole page to scroll sideways). Collapses behind a toggle
// instead of just wrapping messily.
export function Layout() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  // Landing.tsx has its own full footer (real GitHub link, license line,
  // sitemap) matching the mockup — this shared one would just duplicate it.
  const { pathname } = useLocation();
  const showSharedFooter = pathname !== "/";

  const navLinks = (
    <>
      <NavLink to="/browse" onClick={() => setMenuOpen(false)}>
        Discover
      </NavLink>
      <NavLink to="/countries" onClick={() => setMenuOpen(false)}>
        Countries
      </NavLink>
      <NavLink to="/languages" onClick={() => setMenuOpen(false)}>
        Languages
      </NavLink>
      {user && (
        <NavLink to="/submit" onClick={() => setMenuOpen(false)}>
          Submit a Story
        </NavLink>
      )}
      {user && (
        <NavLink to="/my-submissions" onClick={() => setMenuOpen(false)}>
          Library
        </NavLink>
      )}
      {(user?.role === "moderator" || user?.role === "admin") && (
        <NavLink to="/moderation" onClick={() => setMenuOpen(false)}>
          Moderation Queue
        </NavLink>
      )}
      {user?.role === "admin" && (
        <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
          Admin
        </NavLink>
      )}
    </>
  );

  const authControls = isLoading ? null : user ? (
    <>
      <span className="text-sm text-adinkra-700 whitespace-nowrap">
        {user.name} <span className="opacity-60">({user.role})</span>
      </span>
      <button
        onClick={() => {
          logout.mutate();
          setMenuOpen(false);
        }}
        className="btn btn-ghost"
      >
        Log out
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>
        Sign in
      </Link>
      <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
        Get started
      </Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="nav sticky top-0 z-10 bg-adinkra-50 border-b border-[color:var(--color-divider)] px-6 md:px-14">
        <Link to="/" className="nav-brand flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <span className="w-[34px] h-[34px] rounded-full bg-adinkra-500 flex-none" />
          OpenFolklore
        </Link>

        {/* Desktop: everything in one row */}
        <div className="hidden md:contents">{navLinks}</div>
        <div className="hidden md:flex ml-auto items-center gap-3">
          <Link to="/browse" className="btn btn-icon" aria-label="Search stories">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          {authControls}
        </div>

        {/* Mobile: hamburger toggle only */}
        <button
          className="md:hidden ml-auto btn btn-icon"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-1 px-6 py-4 bg-adinkra-50 border-b border-[color:var(--color-divider)]">
          {navLinks}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[color:var(--color-divider)]">
            {authControls}
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {showSharedFooter && (
        <footer className="border-t border-[color:var(--color-divider)] py-4 text-center text-xs text-adinkra-600">
          Stories are licensed CC BY-NC-SA 4.0 by default — see each story for its specific license and attribution.
        </footer>
      )}
    </div>
  );
}
