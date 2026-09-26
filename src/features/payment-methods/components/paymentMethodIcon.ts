const ICON_RULES: [RegExp, string][] = [
  [/efectivo|cash/i, "💵"],
  [/qr/i, "📱"],
  [/transfer/i, "🏦"],
  [/cr[eé]dito/i, "💳"],
];

export function paymentMethodIcon(name: string): string {
  return ICON_RULES.find(([pattern]) => pattern.test(name))?.[1] ?? "💳";
}
