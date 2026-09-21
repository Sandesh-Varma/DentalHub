import { DayOfWeek } from "../../generated/prisma/client.js";

const JS_DAY_TO_ENUM: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

export function getDayOfWeekFromDate(date: Date): DayOfWeek {
  return JS_DAY_TO_ENUM[date.getDay()];
}
