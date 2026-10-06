import type { ReportPeriod, ReportRange } from "@/features/reports/types";

export const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const;

export const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export const REPORT_PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "S", label: "Semana" },
  { value: "M", label: "Mes" },
  { value: "6M", label: "6 meses" },
  { value: "A", label: "Año" },
];

const DEFAULT_PERIOD: ReportPeriod = "6M";

// Dates are plain "YYYY-MM-DD" strings in the app time zone; all math goes
// through UTC so the server's own time zone never shifts a day.
export function parseYmd(ymd: string): [year: number, monthIndex: number, day: number] {
  const [year, month, day] = ymd.split("-").map(Number);
  return [year, month - 1, day];
}

function toYmd(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ymdOf(year: number, monthIndex: number, day: number): string {
  return toYmd(new Date(Date.UTC(year, monthIndex, day)));
}

export function addDays(ymd: string, days: number): string {
  const [year, monthIndex, day] = parseYmd(ymd);
  return ymdOf(year, monthIndex, day + days);
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = parseYmd(from);
  const [ty, tm, td] = parseYmd(to);
  return Math.round((Date.UTC(ty, tm, td) - Date.UTC(fy, fm, fd)) / 86_400_000) + 1;
}

export function parseReportPeriod(value: string | undefined | null): ReportPeriod {
  return REPORT_PERIODS.some((option) => option.value === value)
    ? (value as ReportPeriod)
    : DEFAULT_PERIOD;
}

/** 0 is the current period, -1 the previous one. Future offsets are clamped. */
export function parseReportOffset(value: string | undefined | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed > 0) return 0;
  return parsed;
}

/**
 * S: rolling 7 days ending today. M: calendar month. 6M: the last six
 * complete months. A: calendar year.
 */
export function getReportRange(
  period: ReportPeriod,
  offset: number,
  today: string,
): ReportRange {
  const [year, monthIndex] = parseYmd(today);

  if (period === "S") {
    const to = addDays(today, offset * 7);
    return { from: addDays(to, -6), to };
  }

  if (period === "M") {
    const from = ymdOf(year, monthIndex + offset, 1);
    const [y, m] = parseYmd(from);
    return { from, to: ymdOf(y, m, daysInMonth(y, m)) };
  }

  if (period === "6M") {
    const endMonth = monthIndex - 1 + offset * 6;
    const to = ymdOf(year, endMonth + 1, 0);
    return { from: ymdOf(year, endMonth - 5, 1), to };
  }

  return { from: ymdOf(year + offset, 0, 1), to: ymdOf(year + offset, 11, 31) };
}

export function formatRangeLabel(period: ReportPeriod, range: ReportRange): string {
  const [fy, fm, fd] = parseYmd(range.from);
  const [ty, tm, td] = parseYmd(range.to);

  if (period === "S") {
    if (fy !== ty) {
      return `${fd} ${MONTHS_SHORT[fm]} ${fy} – ${td} ${MONTHS_SHORT[tm]} ${ty}`;
    }
    if (fm !== tm) {
      return `${fd} ${MONTHS_SHORT[fm]} – ${td} ${MONTHS_SHORT[tm]} ${ty}`;
    }
    return `${fd} – ${td} ${MONTHS_SHORT[tm]} ${ty}`;
  }

  if (period === "M") return `${MONTHS_LONG[fm]} ${fy}`;

  if (period === "6M") {
    return fy === ty
      ? `${MONTHS_SHORT[fm]} – ${MONTHS_SHORT[tm]} ${ty}`
      : `${MONTHS_SHORT[fm]} ${fy} – ${MONTHS_SHORT[tm]} ${ty}`;
  }

  return String(fy);
}

const RELATIVE_UNITS: Record<
  ReportPeriod,
  { current: string; previous: string; plural: string }
> = {
  S: { current: "esta semana", previous: "semana pasada", plural: "semanas" },
  M: { current: "este mes", previous: "mes pasado", plural: "meses" },
  "6M": {
    current: "últimos 6 meses",
    previous: "6 meses anteriores",
    plural: "semestres",
  },
  A: { current: "este año", previous: "año pasado", plural: "años" },
};

export function formatRelativeLabel(period: ReportPeriod, offset: number): string {
  const unit = RELATIVE_UNITS[period];
  if (offset === 0) return unit.current;
  if (offset === -1) return unit.previous;
  return `hace ${-offset} ${unit.plural}`;
}
