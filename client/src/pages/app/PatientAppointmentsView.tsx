import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import type { AppointmentStatus } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/patient/EmptyState";
import { cn } from "@/lib/utils";

type Apt = {
  id: string;
  appointmentDate: string;
  startTime: string;
  reason?: string;
  status: AppointmentStatus;
  doctor?: { user: { name: string }; address?: string };
};

type Props = {
  appointments: Apt[];
  onCancel: (id: string) => void;
  cancelling?: boolean;
};

export function PatientAppointmentsView({ appointments, onCancel, cancelling }: Props) {
  const upcoming = appointments.filter(
    (a) => !["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status)
  );
  const past = appointments.filter((a) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(a.status)
  );

  if (!appointments.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="No appointments"
        description="Book a visit to see it listed here."
        action={
          <Link to="/app/book">
            <Button>Book appointment</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <AppointmentRow
                key={apt.id}
                apt={apt}
                onCancel={onCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Past</h2>
          <div className="space-y-3">
            {past.map((apt) => (
              <AppointmentRow key={apt.id} apt={apt} muted />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AppointmentRow({
  apt,
  onCancel,
  cancelling,
  muted,
}: {
  apt: Apt;
  onCancel?: (id: string) => void;
  cancelling?: boolean;
  muted?: boolean;
}) {
  const canCancel = !muted && ["PENDING", "CONFIRMED"].includes(apt.status);

  return (
    <Card className={cn("border-border p-4", muted && "opacity-75")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">
            {format(new Date(apt.appointmentDate), "EEE, MMM d, yyyy")} at {apt.startTime}
          </p>
          <p className="mt-0.5 text-sm text-muted">Dr. {apt.doctor?.user?.name}</p>
          {apt.reason && <p className="mt-1 text-sm text-muted">{apt.reason}</p>}
        </div>
        <StatusBadge status={apt.status} />
      </div>
      {canCancel && onCancel && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 text-danger hover:bg-red-50"
          disabled={cancelling}
          onClick={() => onCancel(apt.id)}
        >
          Cancel
        </Button>
      )}
    </Card>
  );
}
