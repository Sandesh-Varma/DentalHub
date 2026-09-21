import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/api";

const statusStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-slate-200 text-slate-600",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status]
      )}
    >
      {status.toLowerCase().replace("_", " ")}
    </span>
  );
}
