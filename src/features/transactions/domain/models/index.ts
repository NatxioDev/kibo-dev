import type { CurrencyCode } from "@/core/domain/value-objects";

export type TransactionType = "EXPENSE" | "INCOME";
export type TransactionCurrency = CurrencyCode;
export type TransactionSource = "MANUAL" | "IMAGE" | "TEXT" | "AUDIO";
export type TransactionStatus = "DRAFT" | "CONFIRMED";

export type AccountType =
  | "SAVINGS"
  | "CHECKING"
  | "CASH"
  | "EXPENSES"
  | "OTHER";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: TransactionCurrency;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PaymentMethod = {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  payment_method_id: string | null;
  type: TransactionType;
  amount: number;
  currency: TransactionCurrency;
  date: string;
  merchant: string | null;
  description: string | null;
  source: TransactionSource;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
};

export type TransactionWithRelations = Transaction & {
  account: Pick<Account, "id" | "name" | "currency" | "type"> | null;
  category: Pick<Category, "id" | "name" | "icon"> | null;
  payment_method: Pick<PaymentMethod, "id" | "name"> | null;
};

export type TransactionFormValues = {
  type: TransactionType;
  amount: number;
  currency: TransactionCurrency;
  date: string;
  account_id: string | null;
  category_id: string | null;
  payment_method_id: string | null;
  merchant: string | null;
  description: string | null;
};
