import type { AccountType } from "@/features/transactions/domain/models";

const TYPE_ICONS: Record<AccountType, string> = {
  SAVINGS: "🏦",
  CHECKING: "🏧",
  CASH: "💵",
  EXPENSES: "🧾",
  OTHER: "💼",
};

export function accountIcon(type: AccountType): string {
  return TYPE_ICONS[type] ?? "💼";
}
