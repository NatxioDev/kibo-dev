import { Currency, type CurrencyCode } from "./Currency";

type FormatOptions = {
  sign?: "+" | "-";
};

export class Money {
  private constructor(
    readonly minorUnits: number,
    readonly currency: Currency,
  ) {}

  static of(amount: number, currency: Currency | CurrencyCode): Money {
    const resolved =
      typeof currency === "string" ? Currency.from(currency) : currency;
    const factor = 10 ** resolved.fractionDigits;
    const scaled = Number.isFinite(amount)
      ? Math.round(Number((amount * factor).toPrecision(15)))
      : 0;
    return new Money(scaled, resolved);
  }

  /** Parses a canonical amount string ("1234.5"), as produced by `sanitizeInput`. */
  static parse(
    canonical: string,
    currency: Currency | CurrencyCode,
  ): Money | null {
    if (!/^\d+(\.\d*)?$/.test(canonical)) return null;
    return Money.of(Number(canonical), currency);
  }

  /**
   * Normalizes raw user input into a canonical string with "." as decimal
   * separator. Both "," and "." are accepted as decimal keys because mobile
   * decimal keyboards only expose one of them; when both appear (pasted
   * values) the last one is the decimal separator.
   */
  static sanitizeInput(
    raw: string,
    currency: Currency | CurrencyCode,
  ): string {
    const resolved =
      typeof currency === "string" ? Currency.from(currency) : currency;
    const cleaned = raw.replace(/[^\d.,]/g, "");

    const hasDot = cleaned.includes(".");
    const hasComma = cleaned.includes(",");
    const decimalIndex =
      hasDot && hasComma
        ? Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","))
        : cleaned.search(/[.,]/);

    if (decimalIndex === -1) return stripLeadingZeros(cleaned);

    const whole = cleaned.slice(0, decimalIndex).replace(/[.,]/g, "");
    const fraction = cleaned
      .slice(decimalIndex + 1)
      .replace(/[.,]/g, "")
      .slice(0, resolved.fractionDigits);

    return `${stripLeadingZeros(whole) || "0"}.${fraction}`;
  }

  /** Renders a canonical amount string with the currency's decimal separator. */
  static toInputDisplay(
    canonical: string,
    currency: Currency | CurrencyCode,
  ): string {
    const resolved =
      typeof currency === "string" ? Currency.from(currency) : currency;
    return canonical.replace(".", resolved.decimalSeparator);
  }

  toNumber(): number {
    return this.minorUnits / 10 ** this.currency.fractionDigits;
  }

  format({ sign }: FormatOptions = {}): string {
    const { fractionDigits, decimalSeparator, thousandsSeparator } =
      this.currency;
    const absolute = Math.abs(this.minorUnits);
    const factor = 10 ** fractionDigits;

    const whole = Math.floor(absolute / factor)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
    const fraction = (absolute % factor)
      .toString()
      .padStart(fractionDigits, "0");
    const number =
      fractionDigits > 0 ? `${whole}${decimalSeparator}${fraction}` : whole;

    const prefix = sign ?? (this.minorUnits < 0 ? "-" : "");
    return `${prefix}${this.currency.symbolPrefix}${number}`;
  }

  equals(other: Money): boolean {
    return (
      this.minorUnits === other.minorUnits &&
      this.currency.equals(other.currency)
    );
  }
}

function stripLeadingZeros(digits: string): string {
  return digits.replace(/^0+(?=\d)/, "");
}
