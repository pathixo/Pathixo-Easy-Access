/**
 * Formats a UTC timestamp in Asia/Kolkata timezone (IST: UTC+5:30)
 */
export function formatKolkataTime(utcTimestamp: string | Date | null | undefined): string {
  if (!utcTimestamp) return "—";
  try {
    const date = new Date(utcTimestamp);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }) + " IST";
  } catch {
    return String(utcTimestamp);
  }
}

/**
 * Neutralizes CSV Formula Injection (DDE attacks)
 * If a cell begins with '=', '+', '-', or '@', prepend a single quote (')
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }

  let str = String(value);

  // Formula injection check
  if (/^[=+\-@]/.test(str)) {
    str = "'" + str;
  }

  // Escape quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Builds CSV content from header array and rows array
 */
export function buildCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerRow = headers.map(escapeCsvCell).join(",");
  const dataRows = rows.map((row) => row.map(escapeCsvCell).join(","));
  return [headerRow, ...dataRows].join("\r\n");
}
