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
   * Normalizes raw input (usually the grouped value shown by `toInputDisplay`
   * plus the user's edit) into a canonical string with "." as decimal
   * separator.
   *
   * - The currency's decimal separator is always the decimal.
   * - The thousands separator is grouping, except when typed as the last
   *   character: mobile decimal keyboards only expose one of "," / ".", so it
   *   must also work as the decimal key.
   * - A thousands separator after the decimal one with digits following
   *   (e.g. "1,234.56" pasted into BOB) means a foreign format: the last
   *   separator is the decimal.
   * - For pasted text, a lone thousands separator not followed by exactly 3
   *   digits is a decimal ("12.50" pasted into BOB is 12,50).
   */
  static sanitizeInput(
    raw: string,
    currency: Currency | CurrencyCode,
    { pasted = false }: { pasted?: boolean } = {},
  ): string {
    const resolved =
      typeof currency === "string" ? Currency.from(currency) : currency;
    const { decimalSeparator, thousandsSeparator } = resolved;
    let cleaned = raw.replace(/[^\d.,]/g, "");

    const lastDecimal = cleaned.lastIndexOf(decimalSeparator);
    const lastThousands = cleaned.lastIndexOf(thousandsSeparator);
    const endsWithThousands =
      lastThousands !== -1 && lastThousands === cleaned.length - 1;

    let decimalIndex: number;
    if (lastDecimal !== -1 && lastThousands > lastDecimal) {
      if (endsWithThousands) {
        cleaned = cleaned.slice(0, -1);
        decimalIndex = cleaned.indexOf(decimalSeparator);
      } else {
        decimalIndex = lastThousands;
      }
    } else if (lastDecimal !== -1) {
      decimalIndex = cleaned.indexOf(decimalSeparator);
    } else if (endsWithThousands) {
      decimalIndex = lastThousands;
    } else if (
      pasted &&
      lastThousands !== -1 &&
      cleaned.length - lastThousands - 1 !== 3
    ) {
      decimalIndex = lastThousands;
    } else {
      decimalIndex = -1;
    }

    if (decimalIndex === -1) {
      return stripLeadingZeros(cleaned.replace(/[.,]/g, ""));
    }

    const whole = cleaned.slice(0, decimalIndex).replace(/[.,]/g, "");
    const fraction = cleaned
      .slice(decimalIndex + 1)
      .replace(/[.,]/g, "")
      .slice(0, resolved.fractionDigits);

    return `${stripLeadingZeros(whole) || "0"}.${fraction}`;
  }

  /**
   * Renders a canonical amount string with the currency's separators, keeping
   * a trailing decimal separator so the user can keep typing ("12." -> "12,").
   */
  static toInputDisplay(
    canonical: string,
    currency: Currency | CurrencyCode,
  ): string {
    const resolved =
      typeof currency === "string" ? Currency.from(currency) : currency;
    const [whole, fraction] = canonical.split(".");
    const grouped = groupThousands(whole, resolved.thousandsSeparator);
    return fraction === undefined
      ? grouped
      : `${grouped}${resolved.decimalSeparator}${fraction}`;
  }

  toNumber(): number {
    return this.minorUnits / 10 ** this.currency.fractionDigits;
  }

  format({ sign }: FormatOptions = {}): string {
    const { fractionDigits, decimalSeparator, thousandsSeparator } =
      this.currency;
    const absolute = Math.abs(this.minorUnits);
    const factor = 10 ** fractionDigits;

    const whole = groupThousands(
      Math.floor(absolute / factor).toString(),
      thousandsSeparator,
    );
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

function groupThousands(digits: string, separator: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

function stripLeadingZeros(digits: string): string {
  return digits.replace(/^0+(?=\d)/, "");
}
