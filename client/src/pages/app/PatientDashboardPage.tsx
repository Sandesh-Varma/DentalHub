import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Calendar, CalendarDays, Bell, User, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/patient/EmptyState";

export function PatientDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-card bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const upcoming = data?.upcoming ?? [];

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting()}, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-muted">Your appointments at a glance.</p>
        </div>
        <Link to="/app/book">
          <Button className="shadow-sm hover:shadow-md transition-shadow">
            Book appointment
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Upcoming"
          value={stats.upcomingCount ?? 0}
          icon={Calendar}
          trend="Confirmed appointments"
          colorClass="text-teal-600 bg-teal-50"
        />
        <StatCard
          label="Past visits"
          value={stats.pastCount ?? 0}
          icon={CalendarDays}
          trend="Your completed history"
          colorClass="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          label="Notifications"
          value={stats.unreadCount ?? 0}
          icon={Bell}
          trend="Unread inbox events"
          colorClass="text-amber-600 bg-amber-50"
        />
      </div>

      <Card className="border border-border/80 shadow-soft">
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming appointments</CardTitle>
          <Link to="/app/appointments" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6">
          {upcoming.length === 0 ? (
            <div className="py-2">
              <EmptyState
                icon={Calendar}
                title="No upcoming appointments"
                description="When you book a visit, it will appear here."
                action={
                  <Link to="/app/book">
                    <Button variant="outline" size="sm">
                      Book appointment
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {upcoming.map(
                (apt: {
                  id: string;
                  appointmentDate: string;
                  startTime: string;
                  status: string;
                  reason?: string;
                  doctor?: { user: { name: string } };
                }) => {
                  const doctorName = apt.doctor?.user?.name ?? "Dentist";
                  const initials = doctorName
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
                          <h4 className="font-semibold text-foreground leading-none">Dr. {doctorName}</h4>
                          <p className="mt-1.5 text-xs text-muted">
                            {format(new Date(apt.appointmentDate), "EEE, MMM d, yyyy")} at {apt.startTime}
                            {apt.reason ? ` · ${apt.reason}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <StatusBadge status={apt.status as never} />
                        <Link
                          to="/app/appointments"
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
