import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function dateFormatDistance(date: Date) {
  return formatDistanceToNow(date, { locale: id, addSuffix: true });
}
export function dateFormat(date: Date) {
  return date.toLocaleString('id-ID');
}

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function calculateMinutes(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Convert both times to total minutes since midnight
  const start = startHour * 60 + startMinute;
  const end = (endHour < startHour ? endHour + 24 : endHour) * 60 + endMinute;

  return end - start;
}

export function isTimeNotWithinRange(
  startTime: string,
  endTime: string,
  timeNow: string = new Date().toTimeString().slice(0, 5)
): boolean {

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const now = timeToMinutes(timeNow);

  // Check for cross-midnight range
  if (end < start) {
    // Cross-midnight: split the range into two parts:
    // 1. From startTime to midnight (1440 minutes)
    // 2. From midnight to endTime
    return !(now >= start || now < end);
  }

  // Normal case (no cross-midnight)
  return !(now >= start && now < end);
}