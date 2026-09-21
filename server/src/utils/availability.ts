import { parseTimeToMinutes } from "./slots.js";
import { parseLocalDate } from "./parseLocalDate.js";

export type UnavailabilityRow = {
  startTime: string | null;
  endTime: string | null;
};

/** True if the entire day is marked unavailable. */
export function isFullDayBlocked(blocks: UnavailabilityRow[]): boolean {
  return blocks.some((b) => b.startTime == null && b.endTime == null);
}

/** True if this slot falls inside a partial block. */
export function isSlotBlocked(
  slotStart: string,
  blocks: UnavailabilityRow[]
): boolean {
  if (isFullDayBlocked(blocks)) return true;

  const startMin = parseTimeToMinutes(slotStart);
  for (const b of blocks) {
    if (!b.startTime || !b.endTime) continue;
    const blockStart = parseTimeToMinutes(b.startTime);
    const blockEnd = parseTimeToMinutes(b.endTime);
    if (startMin >= blockStart && startMin < blockEnd) return true;
  }
  return false;
}

export function dateToKey(date: Date): string {
  // @db.Date values from Postgres are UTC midnight — use UTC parts.
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse YYYY-MM-DD for @db.Date columns (UTC midnight). */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function dateRangeForKey(key: string): { gte: Date; lt: Date } {
  const date = parseDateKey(key);
  return {
    gte: date,
    lt: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)),
  };
}
