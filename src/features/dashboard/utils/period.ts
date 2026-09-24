import type { DashboardPeriod } from "@/features/dashboard/types";

const MONTHS_LONG = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateString(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export type PeriodRange = {
  from: string;
  to: string;
};

export function parseDashboardPeriod(
  value: string | undefined | null,
): DashboardPeriod {
  if (
    value === "this_month" ||
    value === "last_month" ||
    value === "last_3_months"
  ) {
    return value;
  }
  return "this_month";
}

export function getPeriodRange(
  period: DashboardPeriod,
  now: Date = new Date(),
): PeriodRange {
  const year = now.getFullYear();
  const monthIndex = now.getMonth();

  if (period === "this_month") {
    return {
      from: toDateString(year, monthIndex, 1),
      to: toDateString(year, monthIndex, lastDayOfMonth(year, monthIndex)),
    };
  }

  if (period === "last_month") {
    const lastMonthDate = new Date(year, monthIndex - 1, 1);
    const y = lastMonthDate.getFullYear();
    const m = lastMonthDate.getMonth();
    return {
      from: toDateString(y, m, 1),
      to: toDateString(y, m, lastDayOfMonth(y, m)),
    };
  }

  // last_3_months: from day 1 of (current month - 2) to end of current month
  const startDate = new Date(year, monthIndex - 2, 1);
  const startY = startDate.getFullYear();
  const startM = startDate.getMonth();

  return {
    from: toDateString(startY, startM, 1),
    to: toDateString(year, monthIndex, lastDayOfMonth(year, monthIndex)),
  };
}

export function getPeriodLabel(
  period: DashboardPeriod,
  now: Date = new Date(),
): string {
  const year = now.getFullYear();
  const monthIndex = now.getMonth();

  if (period === "this_month") {
    return `${MONTHS_LONG[monthIndex]} ${year}`;
  }

  if (period === "last_month") {
    const lastMonthDate = new Date(year, monthIndex - 1, 1);
    return `${MONTHS_LONG[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()}`;
  }

  const startDate = new Date(year, monthIndex - 2, 1);
  const startLabel = `${MONTHS_LONG[startDate.getMonth()].slice(0, 3)} ${startDate.getFullYear()}`;
  const endLabel = `${MONTHS_LONG[monthIndex].slice(0, 3)} ${year}`;
  return `${startLabel} – ${endLabel}`;
}
