import { Currency } from "@/core/domain/value-objects";
import type { TransactionCurrency } from "@/features/transactions/types";

const MINUS = "−";

function groupedInteger(value: number, currency: Currency): string {
  return Math.abs(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
}

function signOf(rounded: number, signed: boolean): string {
  if (rounded < 0) return MINUS;
  return signed && rounded > 0 ? "+" : "";
}

/** Whole units: reports compare magnitudes, cents only add noise. */
export function splitReportAmount(amount: number, code: TransactionCurrency) {
  const currency = Currency.from(code);
  return { symbol: currency.symbol, value: groupedInteger(Math.round(amount), currency) };
}

export function formatReportAmount(
  amount: number,
  code: TransactionCurrency,
  { signed = false }: { signed?: boolean } = {},
): string {
  const currency = Currency.from(code);
  const rounded = Math.round(amount);
  return `${signOf(rounded, signed)}${currency.symbolPrefix}${groupedInteger(rounded, currency)}`;
}

/** Balance pill under a chart group: no symbol, compact ("+1,3k") when space is tight. */
export function formatBalancePill(
  amount: number,
  code: TransactionCurrency,
  compact: boolean,
): string {
  const currency = Currency.from(code);
  const rounded = Math.round(amount);
  const sign = signOf(rounded, true);
  if (compact && Math.abs(rounded) >= 1000) {
    const thousands = Math.abs(rounded) / 1000;
    const digits = thousands >= 10 ? 0 : 1;
    return `${sign}${thousands.toFixed(digits).replace(".", currency.decimalSeparator)}k`;
  }
  return `${sign}${groupedInteger(rounded, currency)}`;
}

export function currencyName(code: TransactionCurrency): string {
  return code === "BOB" ? "Bolivianos" : "Dólares";
}
