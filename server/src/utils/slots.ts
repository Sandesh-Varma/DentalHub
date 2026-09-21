export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number
): { start: string; end: string }[] {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const slots: { start: string; end: string }[] = [];

  for (let t = start; t + slotDuration <= end; t += slotDuration) {
    slots.push({
      start: minutesToTime(t),
      end: minutesToTime(t + slotDuration),
    });
  }

  return slots;
}
