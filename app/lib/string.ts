export function truncateString(str: string, maxLength: number = 20): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
}
