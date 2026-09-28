export function formatMoney(amount: number | string, currency = "HTG") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("fr-HT", { style: "currency", currency }).format(n);
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function generateNumber(prefix: string) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}-${ts}-${rand}`;
}
