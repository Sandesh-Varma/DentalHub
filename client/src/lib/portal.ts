import type { UserRole } from "@/lib/api";

export const PATIENT_HOME = "/app";
export const CLINIC_HOME = "/clinic";
export const PATIENT_LOGIN = "/login";
export const CLINIC_LOGIN = "/clinic/login";

export function isStaffRole(role: UserRole) {
  return role === "DOCTOR" || role === "RECEPTIONIST";
}

export function homeForRole(role: UserRole) {
  return role === "PATIENT" ? PATIENT_HOME : CLINIC_HOME;
}
