import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, User, X, Calendar, Phone, Mail, FileText, Trash2, ChevronRight, Info } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminPatientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => (await api.get("/patients")).data,
  });

  const { data: detailPatient, isLoading: detailLoading } = useQuery({
    queryKey: ["patient-detail", selectedPatientId],
    queryFn: async () => (await api.get(`/patients/${selectedPatientId}`)).data,
    enabled: !!selectedPatientId,
  });

  const deactivatePatient = useMutation({
    mutationFn: (id: string) => api.patch(`/patients/${id}/deactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient-detail", selectedPatientId] });
      toast.success("Patient profile deactivated");
    },
    onError: () => {
      toast.error("Could not deactivate patient");
    },
  });

  const filteredPatients = useMemo(() => {
    return (patients ?? []).filter((p: {
      user: { name: string; email: string; phone?: string };
    }) => {
      const name = p.user.name?.toLowerCase() ?? "";
      const email = p.user.email?.toLowerCase() ?? "";
      const phone = p.user.phone?.toLowerCase() ?? "";
      const q = search.toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [patients, search]);

  return (
    <div className="relative space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
        <p className="text-sm text-muted">Browse directory records and review patient histories.</p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-4 text-xs font-medium text-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      <Card className="border border-border/80 shadow-soft">
        <CardTitle className="mb-4">Patient Directory</CardTitle>
        {isLoading ? (
          <div className="space-y-3 py-6">
            <div className="h-6 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-6 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs font-medium">
              <thead>
                <tr className="border-b border-border/60 text-muted uppercase tracking-wider text-[10px] pb-3">
                  <th className="pb-3 pr-4 font-bold">Patient Name</th>
                  <th className="pb-3 pr-4 font-bold">Email Address</th>
                  <th className="pb-3 pr-4 font-bold">Phone Number</th>
                  <th className="pb-3 pr-4 font-bold text-center">Visits</th>
                  <th className="pb-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredPatients.map(
                  (p: {
                    id: string;
                    user: { name: string; email: string; phone?: string; isActive?: boolean };
                    _count: { appointments: number };
                  }) => {
                    const initials = p.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedPatientId(p.id)}
                        className={`cursor-pointer hover:bg-slate-50/60 transition-colors ${
                          selectedPatientId === p.id ? "bg-slate-50" : ""
                        }`}
                      >
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy font-semibold text-xs">
                              {initials}
                            </div>
                            <div>
                              <span className="font-semibold text-foreground block">
                                {p.user.name}
                              </span>
                              {!p.user.isActive && (
                                <span className="inline-block mt-0.5 rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500">{p.user.email}</td>
                        <td className="py-3.5 pr-4 text-slate-500">{p.user.phone ?? "—"}</td>
                        <td className="py-3.5 pr-4 text-center text-foreground font-semibold">
                          {p._count.appointments}
                        </td>
                        <td className="py-3.5 text-right text-slate-400">
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>

            {filteredPatients.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <User className="h-8 w-8 text-slate-300" />
                <h3 className="mt-4 text-sm font-semibold text-foreground">No patients found</h3>
                <p className="mt-1 text-xs text-muted max-w-xs leading-relaxed">
                  No records matched your search parameters. Try adjusting your search query.
                </p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Side Sliding Drawer Sheet for Patient Details */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy/20 backdrop-blur-xs transition-opacity duration-300">
          {/* Drawer backdrop clickable close */}
          <div className="absolute inset-0" onClick={() => setSelectedPatientId(null)} />

          <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-white shadow-2xl transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-foreground">Patient Profile File</h3>
                <p className="text-[10px] text-muted">Clinic ID: {selectedPatientId.slice(0, 8)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setSelectedPatientId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="space-y-4 py-8">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              ) : detailPatient ? (
                <>
                  {/* Avatar & Contacts Card */}
                  <div className="flex items-center gap-4 rounded-2xl border border-border p-4 bg-slate-50/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-white font-bold text-base shadow-sm">
                      {detailPatient.user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground leading-snug">
                        {detailPatient.user.name}
                      </h4>
                      <span className="text-xs text-muted block mt-0.5">
                        Registered patient account
                      </span>
                    </div>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <DetailItem icon={Mail} label="Email Address" value={detailPatient.user.email} />
                    <DetailItem icon={Phone} label="Phone Number" value={detailPatient.user.phone ?? "—"} />
                    <DetailItem
                      icon={Calendar}
                      label="Date of Birth"
                      value={
                        detailPatient.dob
                          ? format(new Date(detailPatient.dob), "MMMM d, yyyy")
                          : "—"
                      }
                    />
                    <DetailItem
                      icon={User}
                      label="Gender Reference"
                      value={detailPatient.gender ? detailPatient.gender.toLowerCase() : "—"}
                      className="capitalize"
                    />
                    <div className="sm:col-span-2">
                      <DetailItem icon={FileText} label="Residential Address" value={detailPatient.address ?? "—"} />
                    </div>
                    <div className="sm:col-span-2">
                      <DetailItem icon={Info} label="Emergency Contact Info" value={detailPatient.emergencyContact ?? "—"} />
                    </div>
                  </div>

                  {/* Appointment History Timeline */}
                  <div className="border-t border-border/60 pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                      Visits History
                    </h4>

                    {detailPatient.appointments?.length === 0 ? (
                      <p className="text-xs text-muted bg-slate-50 p-4 rounded-xl text-center border border-border/40">
                        No appointment entries logged for this patient.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {detailPatient.appointments.map(
                          (apt: {
                            id: string;
                            appointmentDate: string;
                            startTime: string;
                            status: string;
                            reason?: string;
                            doctor?: { user: { name: string } };
                          }) => (
                            <div
                              key={apt.id}
                              className="flex items-start justify-between gap-4 rounded-xl border border-border p-3 hover:bg-slate-50/30 transition-colors"
                            >
                              <div>
                                <span className="block text-xs font-bold text-foreground">
                                  {format(new Date(apt.appointmentDate), "MMM d, yyyy")} · {apt.startTime}
                                </span>
                                <span className="text-[10px] text-muted block mt-0.5">
                                  Doctor: {apt.doctor?.user?.name ?? "Dentist"}
                                </span>
                                {apt.reason && (
                                  <span className="text-[10px] text-slate-500 block mt-1 italic leading-relaxed">
                                    &ldquo;{apt.reason}&rdquo;
                                  </span>
                                )}
                              </div>
                              <StatusBadge status={apt.status as never} />
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Deactivate Button Area */}
                  {detailPatient.user.isActive && (
                    <div className="border-t border-border/60 pt-6">
                      <Button
                        variant="outline"
                        className="w-full border-rose-100 text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 py-2.5 text-xs shadow-none font-semibold"
                        onClick={() => {
                          if (confirm("Deactivate this patient profile? Account login will be disabled.")) {
                            deactivatePatient.mutate(selectedPatientId);
                          }
                        }}
                        disabled={deactivatePatient.isPending}
                      >
                        <Trash2 className="h-4 w-4" /> Deactivate Patient Account
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">Error loading patient details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/40 p-3 bg-slate-50/20">
      <Icon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
      <div>
        <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none">
          {label}
        </span>
        <span className={cn("text-xs font-semibold text-foreground block mt-1.5", className)}>
          {value}
        </span>
      </div>
    </div>
  );
}
