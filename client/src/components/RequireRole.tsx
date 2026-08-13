import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { Role } from "@openfolklore/shared";
import { useAuth } from "../hooks/useAuth";

// Client-side gate for navigation/UX only — every route this protects is
// backed by server-side RBAC (docs/phase7-implementation-plan.md §5) that
// enforces the same rule independently, so this is not the security boundary.
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <p className="text-adinkra-600">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    return <p className="text-red-700">You do not have permission to view this page.</p>;
  }
  return <>{children}</>;
}
