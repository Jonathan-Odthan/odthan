export type PeriodKey = "today" | "7d" | "30d" | "3m" | "year" | "custom";

export function resolvePeriod(period: PeriodKey | undefined, from?: string, to?: string) {
  const now = new Date();
  const end = to ? new Date(to) : now;
  let start: Date;

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "7d":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "3m":
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "custom":
      start = from ? new Date(from) : new Date(now.getFullYear(), 0, 1);
      break;
    case "30d":
    default:
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  return { start, end };
}
