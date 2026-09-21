import type { UserRole } from "@/lib/api";

export const roleLabels: Record<UserRole, string> = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  RECEPTIONIST: "Receptionist",
};

export function formatRole(role: UserRole | undefined) {
  return role ? roleLabels[role] : "";
}
