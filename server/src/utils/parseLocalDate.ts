/** Parse YYYY-MM-DD as local calendar date (avoids UTC day-shift bugs). */
export function parseLocalDate(input: string | Date): Date {
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const date = input instanceof Date ? input : new Date(input);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
