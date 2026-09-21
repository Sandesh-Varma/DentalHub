import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Calendar, Clock, CalendarCheck, Users, CalendarPlus, ChevronRight, User } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

export function ClinicDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-slate-200/80" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const list = data?.todayAppointments ?? data?.upcoming ?? [];

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Clinic dashboard
        </h1>
        <p className="text-muted">
          {user?.role === "DOCTOR"
            ? "Operations overview — open Growth for practice trends."
            : "Today's front desk: patients, bookings, and confirmations."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {user?.role === "DOCTOR" ? (
          <>
            <StatCard
              label="Today's Bookings"
              value={stats.todayCount ?? 0}
              icon={Calendar}
              trend="Scheduled for today"
              colorClass="text-indigo-600 bg-indigo-50"
            />
            <StatCard
              label="Pending Confirmation"
              value={stats.pendingCount ?? 0}
              icon={Clock}
              trend="Awaiting front-desk action"
              colorClass="text-amber-600 bg-amber-50"
            />
            <StatCard
              label="Total Upcoming"
              value={stats.upcomingCount ?? 0}
              icon={CalendarCheck}
              trend="Confirmed future bookings"
              colorClass="text-teal-600 bg-teal-50"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Pending Approval"
              value={stats.pendingCount ?? 0}
              icon={Clock}
              trend="Review and confirm slots"
              colorClass="text-amber-600 bg-amber-50"
            />
            <StatCard
              label="Active Today"
              value={stats.todayCount ?? 0}
              icon={Calendar}
              trend="Today's scheduled check-ins"
              colorClass="text-indigo-600 bg-indigo-50"
            />
            <StatCard
              label="Total Patients"
              value={stats.totalPatients ?? 0}
              icon={Users}
              trend="Registered patient profiles"
              colorClass="text-teal-600 bg-teal-50"
            />
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/clinic/book">
          <Button className="shadow-sm hover:shadow-md transition-shadow">
            <CalendarPlus className="h-4 w-4 mr-1.5" /> Book for patient
          </Button>
        </Link>
        {user?.role === "DOCTOR" && (
          <Link to="/clinic/growth">
            <Button variant="outline">View growth</Button>
          </Link>
        )}
      </div>

      <Card className="border border-border/80 shadow-soft">
        <CardTitle className="flex items-center justify-between">
          <span>Today&apos;s schedule</span>
          <span className="text-xs font-normal text-muted">
            {list.length} {list.length === 1 ? "appointment" : "appointments"}
          </span>
        </CardTitle>
        <div className="mt-6 space-y-4">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-muted">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">No appointments scheduled</h3>
              <p className="mt-1 text-xs text-muted max-w-xs">
                There are no client visits on the calendar for today. You can book an appointment now.
              </p>
              <Link to="/clinic/book" className="mt-4">
                <Button variant="outline" size="sm">
                  Book appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {list.map(
                (apt: {
                  id: string;
                  appointmentDate: string;
                  startTime: string;
                  status: string;
                  reason?: string;
                  doctor?: { user: { name: string } };
                  patient?: { user: { name: string } };
                }) => {
                  const patientName = apt.patient?.user?.name ?? "Guest Patient";
                  const initials = patientName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div
                      key={apt.id}
                      className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy font-semibold text-sm">
                          {initials || <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground leading-none">{patientName}</h4>
                          <p className="mt-1.5 text-xs text-muted">
                            {format(new Date(apt.appointmentDate), "MMM d, yyyy")} at {apt.startTime}
                            {apt.doctor?.user?.name ? ` · Dr. ${apt.doctor.user.name}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <StatusBadge status={apt.status as never} />
                        <Link
                          to="/clinic/appointments"
                          className="p-1 rounded-full text-muted hover:text-foreground hover:bg-slate-50 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  colorClass = "text-primary bg-primary/10",
}: {
  label: string;
  value: number;
  icon: typeof Calendar;
  trend?: string;
  colorClass?: string;
}) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border border-border/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs text-muted">
          <span className="font-semibold text-teal-600 mr-1.5">✦</span>
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
}
