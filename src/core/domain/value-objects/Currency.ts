export const CURRENCY_CODES = ["BOB", "USD"] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

type DecimalSeparator = "," | ".";

export class Currency {
  private constructor(
    readonly code: CurrencyCode,
    readonly symbol: string,
    readonly symbolSpacing: boolean,
    readonly decimalSeparator: DecimalSeparator,
    readonly thousandsSeparator: DecimalSeparator,
    readonly fractionDigits: number,
  ) {}

  static readonly BOB = new Currency("BOB", "Bs", true, ",", ".", 2);
  static readonly USD = new Currency("USD", "$", false, ".", ",", 2);

  static from(code: CurrencyCode): Currency {
    return code === "BOB" ? Currency.BOB : Currency.USD;
  }

  get symbolPrefix(): string {
    return this.symbolSpacing ? `${this.symbol} ` : this.symbol;
  }

  get inputPlaceholder(): string {
    return `0${this.decimalSeparator}${"0".repeat(this.fractionDigits)}`;
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }
}
