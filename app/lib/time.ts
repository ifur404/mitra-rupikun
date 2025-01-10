import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function dateFormatDistance(date: Date) {
  return formatDistanceToNow(date, { locale: id, addSuffix: true });
}
export function dateFormat(date: Date) {
  return date.toLocaleString('id-ID');
}