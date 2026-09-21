import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Search, Calendar, Check, Ban, CheckCircle } from "lucide-react";
import { api, type AppointmentStatus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PatientAppointmentsView } from "@/pages/app/PatientAppointmentsView";

const STATUS_TABS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
];

export function AppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPatient = user?.role === "PATIENT";
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => (await api.get("/appointments")).data,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      api.patch(`/appointments/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment updated");
    },
    onError: (error) => {
      const msg = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : null;
      toast.error(msg ?? "Could not update appointment");
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: (id: string) => api.patch(`/appointments/${id}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment cancelled");
    },
    onError: (error) => {
      const msg = isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message
        : null;
      toast.error(msg ?? "Could not cancel appointment");
    },
  });

  // Client Side Filtering
  const filteredAppointments = useMemo(() => {
    return (appointments ?? []).filter((apt: {
      patient?: { user: { name: string } };
      reason?: string;
      status: string;
    }) => {
      const patientName = apt.patient?.user?.name?.toLowerCase() ?? "";
      const reason = apt.reason?.toLowerCase() ?? "";
      const matchesSearch = patientName.includes(search.toLowerCase()) || reason.includes(search.toLowerCase());
      const matchesTab = activeTab === "ALL" || apt.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [appointments, search, activeTab]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-border/50" />
        <div className="h-40 animate-pulse rounded-card bg-border/40" />
      </div>
    );
  }

  if (isPatient) {
    return (
      <div className="space-y-6 pb-24 md:pb-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="mt-1 text-sm text-muted">Your scheduled and past visits</p>
        </div>
        <PatientAppointmentsView
          appointments={appointments ?? []}
          onCancel={(id) => cancelAppointment.mutate(id)}
          cancelling={cancelAppointment.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <p className="text-sm text-muted">Manage patient bookings, validations, and histories.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search patient or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-xs font-medium text-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <Card className="border border-border/80 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs font-medium">
            <thead>
              <tr className="border-b border-border/60 text-muted uppercase tracking-wider text-[10px]">
                <th className="pb-3 pr-4 font-bold">Date & Time</th>
                <th className="pb-3 pr-4 font-bold">Patient</th>
                <th className="pb-3 pr-4 font-bold">Reason for Visit</th>
                <th className="pb-3 pr-4 font-bold text-center">Status</th>
                <th className="pb-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredAppointments.map(
                (apt: {
                  id: string;
                  appointmentDate: string;
                  startTime: string;
                  reason?: string;
                  status: AppointmentStatus;
                  patient?: { user: { name: string } };
                }) => (
                  <tr key={apt.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {format(new Date(apt.appointmentDate), "MMM d, yyyy")}
                        </span>
                        <span className="text-[10px] text-muted mt-0.5">{apt.startTime}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="font-semibold text-foreground">
                        {apt.patient?.user?.name ?? "Guest Patient"}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-500 max-w-[200px] truncate">
                      {apt.reason ?? "—"}
                    </td>
                    <td className="py-4 pr-4 text-center">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === "PENDING" && (
                          <Button
                            size="sm"
                            className="bg-teal-600 text-white hover:bg-teal-500 text-[11px] h-8 px-2.5 shadow-sm"
                            onClick={() =>
                              updateStatus.mutate({ id: apt.id, status: "CONFIRMED" })
                            }
                          >
                            <Check className="h-3 w-3 mr-1" /> Confirm
                          </Button>
                        )}
                        {apt.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] h-8 px-2.5"
                            onClick={() =>
                              updateStatus.mutate({ id: apt.id, status: "COMPLETED" })
                            }
                          >
                            <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" /> Complete
                          </Button>
                        )}
                        {["PENDING", "CONFIRMED"].includes(apt.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-rose-100 text-rose-700 hover:bg-rose-50 text-[11px] h-8 px-2.5"
                            onClick={() => cancelAppointment.mutate(apt.id)}
                          >
                            <Ban className="h-3 w-3 mr-1 text-rose-600" /> Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
          
          {filteredAppointments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-8 w-8 text-slate-300" />
              <h3 className="mt-4 text-sm font-semibold text-foreground">No appointments found</h3>
              <p className="mt-1 text-xs text-muted max-w-xs leading-relaxed">
                There are no scheduled patient visits matching the current search parameters or active tab filters.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
