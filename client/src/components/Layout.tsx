import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth, useLogout } from "../hooks/useAuth";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-adinkra-700 text-white" : "text-adinkra-800 hover:bg-adinkra-200"
  }`;

export function Layout() {
  const { user, isLoading } = useAuth();
  const logout = useLogout();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-adinkra-100 border-b border-adinkra-300">
        <nav className="max-w-5xl mx-auto flex flex-wrap items-center gap-1 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-adinkra-800 mr-4">
            OpenFolklore
          </Link>
          <NavLink to="/" end className={navLinkClass}>
            Browse
          </NavLink>
          {user && (
            <>
              <NavLink to="/submit" className={navLinkClass}>
                Submit a Story
              </NavLink>
              <NavLink to="/my-submissions" className={navLinkClass}>
                My Submissions
              </NavLink>
            </>
          )}
          {(user?.role === "moderator" || user?.role === "admin") && (
            <NavLink to="/moderation" className={navLinkClass}>
              Moderation Queue
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          <div className="ml-auto flex items-center gap-2">
            {isLoading ? null : user ? (
              <>
                <span className="text-sm text-adinkra-700">
                  {user.name} <span className="opacity-60">({user.role})</span>
                </span>
                <button
                  onClick={() => logout.mutate()}
                  className="px-3 py-2 rounded-md text-sm font-medium text-adinkra-800 hover:bg-adinkra-200"
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-adinkra-200 py-4 text-center text-xs text-adinkra-600">
        Stories are licensed CC BY-NC-SA 4.0 by default — see each story for its specific license and attribution.
      </footer>
    </div>
  );
}
