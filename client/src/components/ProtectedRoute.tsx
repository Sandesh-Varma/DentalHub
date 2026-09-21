import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/api";
import {
  CLINIC_HOME,
  CLINIC_LOGIN,
  isStaffRole,
  PATIENT_HOME,
  PATIENT_LOGIN,
} from "@/lib/portal";

export type Portal = "patient" | "clinic";

export function ProtectedRoute({
  roles,
  portal,
}: {
  roles?: UserRole[];
  portal: Portal;
}) {
  const { user, loading } = useAuth();
  const loginPath = portal === "patient" ? PATIENT_LOGIN : CLINIC_LOGIN;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to={loginPath} replace />;

  if (portal === "patient" && isStaffRole(user.role)) {
    return <Navigate to={CLINIC_HOME} replace />;
  }

  if (portal === "clinic" && user.role === "PATIENT") {
    return <Navigate to={PATIENT_HOME} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={portal === "clinic" ? CLINIC_HOME : PATIENT_HOME} replace />;
  }

  return <Outlet />;
}
