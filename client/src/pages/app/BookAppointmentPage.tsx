import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DoctorAvatar, DoctorSelectCard, type DoctorListItem } from "@/components/DoctorCard";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Stepper } from "@/components/patient/Stepper";
import { cn } from "@/lib/utils";

const STEPS = ["Doctor", "Date", "Time", "Details", "Confirm"];

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");

  const { data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => (await api.get("/doctors")).data,
  });

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["slots", doctorId, date],
    queryFn: async () =>
      (await api.get(`/schedules/doctor/${doctorId}/slots`, { params: { date } })).data,
    enabled: !!doctorId && !!date,
  });

  const bookMutation = useMutation({
    mutationFn: async () =>
      api.post("/appointments", {
        doctorId,
        appointmentDate: date,
        startTime: slot,
        reason,
      }),
    onSuccess: () => {
      toast.success("Appointment request submitted");
      navigate("/app/appointments");
    },
    onError: () => toast.error("Could not book this slot. It may be unavailable."),
  });

  const selectedDoctor = doctors?.find((d: { id: string }) => d.id === doctorId);

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Book appointment</h1>
        <p className="mt-1 text-sm text-muted">Step {step} of {STEPS.length}</p>
      </div>

      <Stepper steps={STEPS} current={step} />

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Select a dentist</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {doctors?.map((d: DoctorListItem) => (
              <DoctorSelectCard
                key={d.id}
                doctor={d}
                selected={doctorId === d.id}
                onSelect={() => setDoctorId(d.id)}
              />
            ))}
          </div>
          <Button disabled={!doctorId} onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <Card className="border border-border/80 p-6 shadow-soft max-w-md">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Date</Label>
          <div className="relative mt-2">
            <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="date"
              className="pl-9 max-w-xs focus:ring-1 focus:ring-teal-600"
              min={format(new Date(), "yyyy-MM-dd")}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button disabled={!date} onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="border border-border/80 p-6 shadow-soft max-w-lg">
          <CardTitle>Available times</CardTitle>
          <p className="mt-1 text-xs text-muted">
            Selected date: {date && format(new Date(date + "T12:00:00"), "EEEE, MMMM d, yyyy")}
          </p>
          {slotsLoading ? (
            <div className="mt-6 flex items-center justify-center py-6 text-xs text-muted">
              <span className="animate-pulse">Loading available hours slots...</span>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {(slotsData?.available ?? []).map((s: { start: string }) => (
                <button
                  key={s.start}
                  type="button"
                  onClick={() => setSlot(s.start)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-200 select-none shadow-sm",
                    slot === s.start
                      ? "border-primary bg-primary text-white shadow-md ring-2 ring-primary/10"
                      : "border-border bg-white text-foreground hover:border-primary/60 hover:bg-slate-50/50"
                  )}
                >
                  {s.start}
                </button>
              ))}
            </div>
          )}
          {!slotsLoading && (slotsData?.available ?? []).length === 0 && (
            <p className="mt-6 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
              No appointments slots available on this date. Ask receptionist or try another date.
            </p>
          )}
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button disabled={!slot} onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="border border-border/80 p-6 shadow-soft max-w-md">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for visit (optional)</Label>
          <Textarea
            className="mt-2 text-xs focus:ring-1 focus:ring-teal-600"
            placeholder="e.g. routine check-up, toothache"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button onClick={() => setStep(5)}>Review</Button>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card className="border border-border/80 p-6 shadow-soft max-w-md overflow-hidden relative">
          <CardTitle>Review & Confirm</CardTitle>
          <p className="text-xs text-muted mt-1">Please inspect your appointment slip details</p>
          
          <div className="mt-5 border-2 border-dashed border-border rounded-2xl p-4 bg-slate-50/40 space-y-4">
            {selectedDoctor && (
              <div className="flex items-center gap-3 border-b border-border/60 pb-3">
                <DoctorAvatar doctor={selectedDoctor} className="h-10 w-10 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">{selectedDoctor.user.name}</p>
                  <p className="text-[10px] text-muted">{selectedDoctor.specialization}</p>
                </div>
              </div>
            )}
            
            <dl className="space-y-2.5 text-xs">
              {[
                ["Booking Date", date && format(new Date(date + "T12:00:00"), "PPP")],
                ["Timing Slot", slot],
                ["Reason", reason || "Routine Consultation"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1 border-b border-border/30 last:border-0 last:pb-0">
                  <dt className="text-muted font-medium">{label}</dt>
                  <dd className="font-semibold text-foreground text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setStep(4)}>
              Back
            </Button>
            <Button disabled={bookMutation.isPending} onClick={() => bookMutation.mutate()}>
              {bookMutation.isPending ? "Submitting…" : "Confirm Booking"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
