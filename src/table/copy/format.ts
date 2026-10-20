const pad = (n: number) => n.toString().padStart(2, "0");

function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;

  const date = value instanceof Date ? value : new Date(value as string);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a date as YYYY-MM-DD in the local time zone.
 * (toISOString uses UTC, which shifts the day in time zones such as JST.)
 */
export function formatDateForCopy(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

/** Formats a date as "YYYY-MM-DD HH:mm:ss" in the local time zone. */
export function formatDatetimeForCopy(value: unknown): string {
  const date = toDate(value);
  if (!date) return "";

  return `${formatDateForCopy(date)} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
}
