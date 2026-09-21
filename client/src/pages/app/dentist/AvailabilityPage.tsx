import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, X, Info, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00"
];

type UnavailabilityItem = {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
};

type ScheduleRow = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
};

export function AvailabilityPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workingDays, setWorkingDays] = useState<string[]>([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ]);
  const [hours, setHours] = useState({
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30 as 15 | 30 | 60,
  });

  const { data: me } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => (await api.get("/auth/me")).data,
  });

  const doctorId = me?.user?.doctor?.id as string | undefined;
  const monthKey = format(month, "yyyy-MM");

  const { data: calendar } = useQuery({
    queryKey: ["calendar", doctorId, monthKey],
    queryFn: async () =>
      (await api.get(`/schedules/doctor/${doctorId}/calendar`, { params: { month: monthKey } }))
        .data,
    enabled: !!doctorId,
  });

  const schedules = calendar?.schedules as ScheduleRow[] | undefined;
  const unavailability = (calendar?.unavailability ?? []) as UnavailabilityItem[];

  useEffect(() => {
    if (schedules?.length) {
      setWorkingDays(schedules.map((s) => s.dayOfWeek));
      const first = schedules[0];
      setHours({
        startTime: first.startTime,
        endTime: first.endTime,
        slotDuration: first.slotDuration as 15 | 30 | 60,
      });
    }
  }, [schedules]);

  const blocksByDate = useMemo(() => {
    const map = new Map<string, UnavailabilityItem[]>();
    for (const b of unavailability) {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    return map;
  }, [unavailability]);

  const workingDaySet = useMemo(
    () => new Set(schedules?.map((s) => s.dayOfWeek) ?? []),
    [schedules]
  );

  const saveTemplate = useMutation({
    mutationFn: () =>
      api.post(`/schedules/doctor/${doctorId}/weekly-template`, {
        days: workingDays,
        ...hours,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["schedules", doctorId] });
      toast.success("Regular clinic hours saved");
    },
    onError: () => toast.error("Could not save hours"),
  });

  const markDayUnavailable = useMutation({
    mutationFn: async (dateKey: string) => {
      await api.post(`/schedules/doctor/${doctorId}/unavailability`, {
        date: dateKey,
        allDay: true,
      });
    },
    onSuccess: (_data, dateKey) => {
      queryClient.invalidateQueries({ queryKey: ["calendar", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["manage-slots", doctorId, dateKey] });
      toast.success("Day marked unavailable");
    },
    onError: () => toast.error("Could not mark day unavailable"),
  });

  const clearDayBlocks = useMutation({
    mutationFn: async (dateKey: string) => {
      await api.delete(`/schedules/doctor/${doctorId}/unavailability/day`, {
        params: { date: dateKey },
      });
    },
    onSuccess: (_data, dateKey) => {
      queryClient.invalidateQueries({ queryKey: ["calendar", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["manage-slots", doctorId, dateKey] });
      toast.success("Day is available again");
    },
    onError: () => toast.error("Could not clear day — try again"),
  });

  const toggleSlotBlock = useMutation({
    mutationFn: async ({
      dateKey,
      start,
      end,
      blockId,
    }: {
      dateKey: string;
      start: string;
      end: string;
      blockId?: string;
    }) => {
      if (blockId) {
        await api.delete(`/schedules/unavailability/${blockId}`);
      } else {
        await api.post(`/schedules/doctor/${doctorId}/unavailability`, {
          date: dateKey,
          startTime: start,
          endTime: end,
        });
      }
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["calendar", doctorId] });
      queryClient.invalidateQueries({ queryKey: ["manage-slots", doctorId, vars.dateKey] });
    },
    onError: () => toast.error("Could not update time slot"),
  });

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  const { data: dayDetail } = useQuery({
    queryKey: ["manage-slots", doctorId, selectedKey],
    queryFn: async () =>
      (
        await api.get(`/schedules/doctor/${doctorId}/manage-slots`, {
          params: { date: selectedKey },
        })
      ).data,
    enabled: !!doctorId && !!selectedKey,
  });

  if (!doctorId) {
    return <p className="text-slate-600">Doctor profile not linked to your account.</p>;
  }

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfDay(new Date());

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const padStart = monthStart.getDay();

  const selectedBlocks = selectedKey ? (blocksByDate.get(selectedKey) ?? []) : [];
  const allDayBlocked = dayDetail?.allDayBlocked ?? selectedBlocks.some((b) => b.allDay);

  function dayStatus(d: Date): "off" | "blocked" | "partial" | "open" | "past" | "no-hours" {
    if (isBefore(d, today)) return "past";
    const dow = format(d, "EEEE").toUpperCase();
    if (!workingDaySet.has(dow)) return "no-hours";
    const key = format(d, "yyyy-MM-dd");
    const blocks = blocksByDate.get(key) ?? [];
    if (blocks.some((b) => b.allDay)) return "blocked";
    if (blocks.some((b) => !b.allDay)) return "partial";
    return "open";
  }

  function toggleWorkingDay(day: string) {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Availability calendar</h1>
        <p className="text-sm text-slate-500">
          Set your regular clinic hours, then block dates or times you are unavailable.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Weekly Template & Calendar */}
        <div className="space-y-6">
          {/* Card 1: Regular Hours */}
          <Card className="border border-border/80 shadow-soft">
            <CardTitle>Regular clinic hours</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              Tick the days you normally work. Everything else is off by default.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <label
                  key={d}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors",
                    workingDays.includes(d)
                      ? "border-teal-600 bg-teal-50 text-teal-900"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="checkbox"
                    className="accent-teal-600 h-3.5 w-3.5"
                    checked={workingDays.includes(d)}
                    onChange={() => toggleWorkingDay(d)}
                  />
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </label>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs font-semibold text-slate-500">Start Hour</Label>
                <select
                  className="mt-1.5 flex h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  value={hours.startTime}
                  onChange={(e) => setHours({ ...hours, startTime: e.target.value })}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={`start-${t}`} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500">End Hour</Label>
                <select
                  className="mt-1.5 flex h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  value={hours.endTime}
                  onChange={(e) => setHours({ ...hours, endTime: e.target.value })}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={`end-${t}`} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500">Slot Length</Label>
                <select
                  className="mt-1.5 flex h-10 w-full rounded-[10px] border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  value={hours.slotDuration}
                  onChange={(e) =>
                    setHours({ ...hours, slotDuration: Number(e.target.value) as 15 | 30 | 60 })
                  }
                >
                  <option value={15}>15 min slots</option>
                  <option value={30}>30 min slots</option>
                  <option value={60}>60 min slots</option>
                </select>
              </div>
            </div>

            <Button
              className="mt-5 w-full sm:w-auto shadow-sm"
              onClick={() => saveTemplate.mutate()}
              disabled={!workingDays.length || saveTemplate.isPending}
            >
              Save regular hours
            </Button>
          </Card>

          {/* Card 2: Interactive Month Grid */}
          <Card className="border border-border/80 shadow-soft">
            <div className="flex items-center justify-between">
              <CardTitle>Mark unavailable dates</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setMonth(subMonths(month, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[7rem] text-center text-xs font-bold text-foreground uppercase tracking-wider">{format(month, "MMMM yyyy")}</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setMonth(addMonths(month, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-500" /> Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> Day off
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Partial block
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Statically closed
              </span>
            </div>

            <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {weekdayLabels.map((l) => (
                <div key={l} className="py-1">
                  {l}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 mt-2">
              {Array.from({ length: padStart }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {days.map((d) => {
                const status = dayStatus(d);
                const key = format(d, "yyyy-MM-dd");
                const isSelected = selectedDate && isSameDay(d, selectedDate);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!isSameMonth(d, month) || status === "past" || status === "no-hours"}
                    onClick={() => {
                      if (status === "no-hours" || status === "past") return;
                      setSelectedDate(d);
                    }}
                    className={cn(
                      "relative flex h-12 flex-col items-center justify-center rounded-xl border text-sm transition-all focus:outline-none",
                      status === "open" && "border-teal-100 bg-teal-50/30 text-teal-900 hover:bg-teal-100/50",
                      status === "blocked" && "border-rose-100 bg-rose-50 text-rose-900 hover:bg-rose-100/80",
                      status === "partial" && "border-amber-100 bg-amber-50 text-amber-900 hover:bg-amber-100/80",
                      status === "no-hours" && "cursor-default border-slate-50 bg-slate-50 text-slate-400 opacity-60",
                      status === "past" && "cursor-default border-slate-50 bg-slate-50 text-slate-300 opacity-40",
                      isSelected && "ring-2 ring-teal-600 ring-offset-1 border-transparent"
                    )}
                  >
                    <span className="text-xs font-semibold">{format(d, "d")}</span>
                    <span className={cn(
                      "absolute bottom-1.5 h-1.5 w-1.5 rounded-full",
                      status === "open" && "bg-teal-500",
                      status === "blocked" && "bg-rose-500",
                      status === "partial" && "bg-amber-500",
                      (status === "past" || status === "no-hours") && "hidden"
                    )} />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Day Inspector details */}
        <div>
          {selectedDate && workingDaySet.has(format(selectedDate, "EEEE").toUpperCase()) ? (
            <Card className="border border-border/80 shadow-soft h-full flex flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted">Daily scheduler</span>
                  <CardTitle className="mt-0.5 text-base">{format(selectedDate, "EEEE, d MMM yyyy")}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedDate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 space-y-5 flex-1">
                <div className="flex items-center gap-3">
                  {allDayBlocked ? (
                    <Button
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs py-2 shadow-sm"
                      onClick={() => clearDayBlocks.mutate(selectedKey!)}
                      disabled={clearDayBlocks.isPending}
                    >
                      Make day available again
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 text-xs py-2"
                      onClick={() => markDayUnavailable.mutate(selectedKey!)}
                      disabled={markDayUnavailable.isPending}
                    >
                      Block entire day
                    </Button>
                  )}
                </div>

                {!dayDetail?.hasSchedule && (
                  <div className="rounded-lg bg-amber-50 p-4 border border-amber-100 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      No regular hours configured for this day of the week. Configure regular clinic hours first.
                    </p>
                  </div>
                )}

                {dayDetail?.hasSchedule && dayDetail.slots?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Hourly schedule slots</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {dayDetail.slots.map(
                        (slot: {
                          start: string;
                          end: string;
                          blocked: boolean;
                          blockId: string | null;
                        }) => (
                          <label
                            key={slot.start}
                            className={cn(
                              "relative flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all select-none",
                              allDayBlocked
                                ? "cursor-not-allowed border-rose-100 bg-rose-50/50 text-rose-400 opacity-60"
                                : slot.blocked
                                  ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/70"
                                  : "border-border bg-white text-foreground hover:border-teal-500 hover:bg-teal-50/20"
                            )}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={slot.blocked}
                              disabled={
                                allDayBlocked ||
                                toggleSlotBlock.isPending ||
                                markDayUnavailable.isPending
                              }
                              onChange={() =>
                                toggleSlotBlock.mutate({
                                  dateKey: selectedKey!,
                                  start: slot.start,
                                  end: slot.end,
                                  blockId: slot.blockId ?? undefined,
                                })
                              }
                            />
                            <span>
                              {slot.start} – {slot.end}
                            </span>
                            <span className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                              slot.blocked ? "bg-rose-100 text-rose-800" : "bg-teal-100 text-teal-800"
                            )}>
                              {slot.blocked ? "Blocked" : "Open"}
                            </span>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                )}

                {allDayBlocked && dayDetail?.hasSchedule && (
                  <div className="rounded-lg bg-rose-50 p-4 border border-rose-100 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Whole day is currently blocked. Patient self-booking and receptionist bookings are disabled for this date.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="border border-border/80 shadow-soft h-full flex flex-col items-center justify-center py-16 text-center text-slate-400 bg-slate-50/30">
              <CalendarDays className="h-8 w-8 text-slate-300" />
              <h3 className="mt-4 text-sm font-semibold text-foreground">Select a day</h3>
              <p className="mt-1 text-xs text-muted max-w-[200px] leading-relaxed mx-auto">
                Click on any open working day on the calendar grid to block custom hours.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
