import type { ReportesPeriod, PeriodRange } from "@/features/reportes/types";

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

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateString(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Returns the timezone used by the application (Bolivia)
 */
export function getAppTimezone(): string {
  return "America/La_Paz";
}

/**
 * Get the current date in La Paz timezone
 */
export function getNowInLaPaz(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: getAppTimezone() })
  );
}

export function parseReportesPeriod(
  value: string | undefined | null
): ReportesPeriod {
  if (value === "S" || value === "M" || value === "6M" || value === "A") {
    return value;
  }
  return "6M";
}

/**
 * Get period range based on period and offset
 * offset = 0 means current period
 * offset = -1 means previous period
 * offset = 1 means next period (used for checking if can navigate forward)
 */
export function getPeriodRange(
  period: ReportesPeriod,
  offset: number = 0,
  now: Date = getNowInLaPaz()
): PeriodRange {
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const dayOfMonth = now.getDate();

  if (period === "S") {
    // Week: last 7 days from today
    const targetDate = new Date(year, monthIndex, dayOfMonth + offset * 7);
    const endDate = new Date(targetDate);
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 6);

    return {
      from: toDateString(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      ),
      to: toDateString(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      ),
    };
  }

  if (period === "M") {
    // Month: full calendar month
    const targetMonth = new Date(year, monthIndex + offset, 1);
    const y = targetMonth.getFullYear();
    const m = targetMonth.getMonth();

    return {
      from: toDateString(y, m, 1),
      to: toDateString(y, m, lastDayOfMonth(y, m)),
    };
  }

  if (period === "6M") {
    // 6 months: from first day of (current month - 5) to last day of current month
    const targetMonth = new Date(year, monthIndex + offset * 6, 1);
    const endY = targetMonth.getFullYear();
    const endM = targetMonth.getMonth();
    const startDate = new Date(endY, endM - 5, 1);
    const startY = startDate.getFullYear();
    const startM = startDate.getMonth();

    return {
      from: toDateString(startY, startM, 1),
      to: toDateString(endY, endM, lastDayOfMonth(endY, endM)),
    };
  }

  // A (year): from January 1 to December 31
  const targetYear = year + offset;
  return {
    from: toDateString(targetYear, 0, 1),
    to: toDateString(targetYear, 11, 31),
  };
}

/**
 * Get period label for display
 */
export function getPeriodLabel(
  period: ReportesPeriod,
  offset: number = 0,
  now: Date = getNowInLaPaz()
): string {
  const range = getPeriodRange(period, offset, now);
  const fromDate = new Date(range.from + "T00:00:00");
  const toDate = new Date(range.to + "T00:00:00");

  if (period === "S") {
    const fromDay = fromDate.getDate();
    const toDay = toDate.getDate();
    const fromMonth = MONTHS_SHORT[fromDate.getMonth()];
    const toMonth = MONTHS_SHORT[toDate.getMonth()];
    const fromYear = fromDate.getFullYear();
    const toYear = toDate.getFullYear();

    if (fromYear === toYear && fromDate.getMonth() === toDate.getMonth()) {
      return `${fromDay} – ${toDay} ${fromMonth} ${fromYear}`;
    } else if (fromYear === toYear) {
      return `${fromDay} ${fromMonth} – ${toDay} ${toMonth} ${fromYear}`;
    } else {
      return `${fromDay} ${fromMonth} ${fromYear} – ${toDay} ${toMonth} ${toYear}`;
    }
  }

  if (period === "M") {
    const month = MONTHS_LONG[toDate.getMonth()];
    const year = toDate.getFullYear();
    return `${month} ${year}`;
  }

  if (period === "6M") {
    const fromMonth = MONTHS_SHORT[fromDate.getMonth()];
    const toMonth = MONTHS_SHORT[toDate.getMonth()];
    const fromYear = fromDate.getFullYear();
    const toYear = toDate.getFullYear();

    if (fromYear === toYear) {
      return `${fromMonth} – ${toMonth} ${toYear}`;
    } else {
      return `${fromMonth} ${fromYear} – ${toMonth} ${toYear}`;
    }
  }

  // A (year)
  return String(toDate.getFullYear());
}

/**
 * Get range display label (e.g., "esta semana", "este mes", "últimos 6 meses")
 */
export function getRangeLabel(
  period: ReportesPeriod,
  offset: number = 0
): string {
  if (offset === 0) {
    switch (period) {
      case "S":
        return "esta semana";
      case "M":
        return "este mes";
      case "6M":
        return "últimos 6 meses";
      case "A":
        return "este año";
    }
  }

  switch (period) {
    case "S":
      return offset > 0 ? "semana" : "semana";
    case "M":
      return offset > 0 ? "mes" : "mes";
    case "6M":
      return "últimos 6 meses";
    case "A":
      return offset > 0 ? "año" : "año";
  }
}

/**
 * Get the label for average expense
 */
export function getAverageLabel(period: ReportesPeriod): string {
  switch (period) {
    case "S":
      return "PROMEDIO DIARIO - GASTOS";
    case "M":
      return "PROMEDIO SEMANAL - GASTOS";
    case "6M":
      return "PROMEDIO MENSUAL - GASTOS";
    case "A":
      return "PROMEDIO MENSUAL - GASTOS";
  }
}

/**
 * Check if we can navigate to the next period (can't go into future)
 */
export function canNavigateForward(
  period: ReportesPeriod,
  offset: number,
  now: Date = getNowInLaPaz()
): boolean {
  if (offset >= 0) return false;

  const nextRange = getPeriodRange(period, offset + 1, now);
  const nextEnd = new Date(nextRange.to + "T23:59:59");

  return nextEnd <= now;
}
