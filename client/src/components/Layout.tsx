import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth, useLogout } from "../hooks/useAuth";

// Nav structure adapted from the Claude Design "OpenFolklore Landing" mockup
// (Discover/Countries/Languages/Library, search, Sign in/Get started) —
// merged with the app's existing real, functional role-aware links
// (Submit/My Submissions/Moderation Queue/Admin), which the mockup — a
// logged-out marketing view — doesn't show but the app needs regardless.
// "Library" maps to My Submissions rather than being a separate page.
export function Layout() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();
  // Landing.tsx has its own full footer (real GitHub link, license line,
  // sitemap) matching the mockup — this shared one would just duplicate it.
  const { pathname } = useLocation();
  const showSharedFooter = pathname !== "/";

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="nav sticky top-0 z-10 bg-adinkra-50 border-b border-[color:var(--color-divider)] px-6 md:px-14">
        <Link to="/" className="nav-brand flex items-center gap-2.5">
          <span className="w-[34px] h-[34px] rounded-full bg-adinkra-500 flex-none" />
          OpenFolklore
        </Link>
        <NavLink to="/browse">Discover</NavLink>
        <NavLink to="/countries">Countries</NavLink>
        <NavLink to="/languages">Languages</NavLink>
        {user && <NavLink to="/submit">Submit a Story</NavLink>}
        {user && <NavLink to="/my-submissions">Library</NavLink>}
        {(user?.role === "moderator" || user?.role === "admin") && (
          <NavLink to="/moderation">Moderation Queue</NavLink>
        )}
        {user?.role === "admin" && <NavLink to="/admin">Admin</NavLink>}

        <div className="ml-auto flex items-center gap-3">
          <Link to="/browse" className="btn btn-icon" aria-label="Search stories">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          {isLoading ? null : user ? (
            <>
              <span className="text-sm text-adinkra-700 whitespace-nowrap">
                {user.name} <span className="opacity-60">({user.role})</span>
              </span>
              <button onClick={() => logout.mutate()} className="btn btn-ghost">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

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
