import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { PageTransition } from "@/components/motion/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type SlotsResponse = {
  slots: { start: string; end: string }[];
  available: { start: string; end: string }[];
};

function bookingErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const msg = (error.response?.data as { message?: string })?.message;
    if (msg) return msg;
  }
  return "Could not complete booking. Check patient, doctor, date, and that availability is set.";
}

export function StaffBookPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");

  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => (await api.get("/patients")).data,
  });

  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await api.get("/doctors")).data,
  });

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", doctorId, date],
    queryFn: async () =>
      (await api.get<SlotsResponse>(`/schedules/doctor/${doctorId}/slots`, { params: { date } }))
        .data,
    enabled: !!doctorId && !!date,
  });

  const availableSlots = slotsData?.available ?? [];

  const book = useMutation({
    mutationFn: () =>
      api.post("/appointments", {
        patientId,
        doctorId,
        appointmentDate: date,
        startTime: slot,
        reason: "Booked by clinic staff",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Appointment booked");
      navigate("/clinic/appointments");
    },
    onError: (error) => toast.error(bookingErrorMessage(error)),
  });

  const noPatients = !patientsLoading && (!patients || patients.length === 0);
  const noDoctors = !doctorsLoading && (!doctors || doctors.length === 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl space-y-6 pb-20">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Book for patient</h1>
          <p className="text-sm text-muted">Schedule an appointment on behalf of a registered patient.</p>
        </div>

        {noPatients && (
          <div className="rounded-lg bg-amber-50 p-4 border border-amber-100 flex items-start gap-2.5">
            <p className="text-xs text-amber-800 leading-relaxed font-semibold">
              No patients registered yet. Patients must create an account on the public site first.
            </p>
          </div>
        )}
        {noDoctors && (
          <div className="rounded-lg bg-amber-50 p-4 border border-amber-100 flex items-start gap-2.5">
            <p className="text-xs text-amber-800 leading-relaxed font-semibold">
              No doctors on file. Add a doctor profile or run the database seed.
            </p>
          </div>
        )}

        <Card className="space-y-5 border border-border/80 p-6 shadow-soft">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient Selection</Label>
            <select
              className="mt-1.5 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Select registered patient...</option>
              {patients?.map(
                (p: { id: string; user: { name: string; email: string } }) => (
                  <option key={p.id} value={p.id}>
                    {p.user.name} ({p.user.email})
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Doctor/Dentist</Label>
            <select
              className="mt-1.5 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={doctorId}
              onChange={(e) => {
                setDoctorId(e.target.value);
                setSlot("");
              }}
            >
              <option value="">Select doctor...</option>
              {doctors?.map(
                (d: { id: string; user: { name: string }; specialization: string }) => (
                  <option key={d.id} value={d.id}>
                    {d.user.name} — {d.specialization}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Appointment Date</Label>
            <Input
              type="date"
              className="mt-1.5 text-sm focus:ring-1 focus:ring-teal-500"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => {
                setDate(e.target.value);
                setSlot("");
              }}
            />
          </div>

          {doctorId && date && (
            <div className="border-t border-border/60 pt-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Time Slots</Label>
              {slotsLoading ? (
                <p className="mt-3 text-xs text-muted animate-pulse">Loading available hours slots...</p>
              ) : availableSlots.length === 0 ? (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                  No open slots on this day. Ask the doctor to set weekly availability hours.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {availableSlots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => setSlot(s.start)}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 select-none shadow-sm ${slot === s.start
                        ? "border-primary bg-primary text-white shadow-md ring-2 ring-primary/10"
                        : "border-border bg-white text-foreground hover:border-primary/60 hover:bg-slate-50/50"
                        }`}
                    >
                      {s.start}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full mt-4 py-2.5 shadow-sm"
            disabled={
              !patientId ||
              !doctorId ||
              !date ||
              !slot ||
              book.isPending ||
              noPatients ||
              noDoctors
            }
            onClick={() => book.mutate()}
          >
            {book.isPending ? "Submitting Booking Request..." : "Confirm Patient Booking"}
          </Button>
        </Card>
      </div>
    </PageTransition>
  );
}
