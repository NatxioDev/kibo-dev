import { todayDateInputValue } from "@/features/transactions/components/formatters";

export type TransactionListPeriod =
  | "this_month"
  | "last_month"
  | "last_7"
  | "last_30"
  | "custom";

export type PeriodRange = {
  from: string;
  to: string;
};

const MONTHS_LONG = [
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

const MONTHS_LONG_TITLE = [
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

const MONTHS_SHORT = [
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

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateString(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function appTodayParts(now: Date = new Date()): {
  year: number;
  monthIndex: number;
  day: number;
  ymd: string;
} {
  const ymd = todayDateInputValue(now);
  const [year, month, day] = ymd.split("-").map(Number);
  return {
    year: year || now.getFullYear(),
    monthIndex: (month || now.getMonth() + 1) - 1,
    day: day || now.getDate(),
    ymd,
  };
}

function shiftYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const probe = new Date(Date.UTC(year, month - 1, day + days));
  return toDateString(
    probe.getUTCFullYear(),
    probe.getUTCMonth(),
    probe.getUTCDate(),
  );
}

export function parseTransactionListPeriod(
  value: string | undefined | null,
): TransactionListPeriod | undefined {
  if (
    value === "this_month" ||
    value === "last_month" ||
    value === "last_7" ||
    value === "last_30" ||
    value === "custom"
  ) {
    return value;
  }
  return undefined;
}

/**
 * Default: Este mes. Bare `from`/`to` (KIBO-23) ⇒ custom for backward compat.
 */
export function resolveTransactionListPeriod(params: {
  period?: string | null;
  from?: string | null;
  to?: string | null;
}): TransactionListPeriod {
  const parsed = parseTransactionListPeriod(params.period);
  if (parsed) return parsed;
  if (params.from || params.to) return "custom";
  return "this_month";
}

export function getTransactionPeriodRange(
  period: Exclude<TransactionListPeriod, "custom">,
  now: Date = new Date(),
): PeriodRange {
  const { year, monthIndex, ymd } = appTodayParts(now);

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

  if (period === "last_7") {
    return { from: shiftYmd(ymd, -6), to: ymd };
  }

  // last_30
  return { from: shiftYmd(ymd, -29), to: ymd };
}

export function formatSpanishDayMonth(
  ymd: string,
  opts: { shortMonth?: boolean; includeYear?: boolean } = {},
): string {
  const [year, month, day] = ymd.split("-").map(Number);
  if (!year || !month || !day) return ymd;
  const monthLabel = opts.shortMonth
    ? `${MONTHS_SHORT[month - 1]}.`
    : MONTHS_LONG[month - 1];
  if (opts.includeYear === false) return `${day} de ${monthLabel}`;
  return `${day} de ${monthLabel} de ${year}`;
}

/** e.g. "1 – 30 de septiembre de 2026" or "31 de ago. – 29 de sep. de 2026" */
export function formatSpanishDateRange(from: string, to: string): string {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return `${from} – ${to}`;

  const sameYear = fy === ty;
  const sameMonth = sameYear && fm === tm;

  if (sameMonth) {
    return `${fd} – ${td} de ${MONTHS_LONG[fm - 1]} de ${ty}`;
  }

  if (sameYear) {
    return `${fd} de ${MONTHS_SHORT[fm - 1]}. – ${td} de ${MONTHS_SHORT[tm - 1]}. de ${ty}`;
  }

  return `${formatSpanishDayMonth(from, { shortMonth: true })} – ${formatSpanishDayMonth(to, { shortMonth: true })}`;
}

export function getPeriodChipLabel(
  period: TransactionListPeriod,
  range: PeriodRange,
  now: Date = new Date(),
): string {
  const { year, monthIndex } = appTodayParts(now);

  if (period === "this_month") {
    return MONTHS_LONG_TITLE[monthIndex];
  }
  if (period === "last_month") {
    const lastMonthDate = new Date(year, monthIndex - 1, 1);
    return MONTHS_LONG_TITLE[lastMonthDate.getMonth()];
  }
  if (period === "last_7") return "Últimos 7 días";
  if (period === "last_30") return "Últimos 30 días";
  return formatSpanishDateRange(range.from, range.to);
}

export function getPeriodOptionLabel(
  period: Exclude<TransactionListPeriod, "custom">,
): string {
  switch (period) {
    case "this_month":
      return "Este mes";
    case "last_month":
      return "Mes pasado";
    case "last_7":
      return "Últimos 7 días";
    case "last_30":
      return "Últimos 30 días";
  }
}

export function isDefaultTransactionPeriod(
  period: TransactionListPeriod,
): boolean {
  return period === "this_month";
}
