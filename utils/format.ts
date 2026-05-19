/**
 * Format a Date to a localized string (dd/mm/yyyy HH:mm).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format bytes to a human-readable string (e.g. 1.5 MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Format cents to currency display (e.g. 1999 → "19,99 €").
 */
export function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });
}
