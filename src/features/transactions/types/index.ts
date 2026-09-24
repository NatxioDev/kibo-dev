export type TransactionType = "EXPENSE" | "INCOME";
export type TransactionCurrency = "BOB" | "USD";
export type TransactionSource = "MANUAL" | "IMAGE" | "TEXT" | "AUDIO";
export type TransactionStatus = "DRAFT" | "CONFIRMED";

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
  category: Pick<Category, "id" | "name"> | null;
  payment_method: Pick<PaymentMethod, "id" | "name"> | null;
};

export type TransactionFormValues = {
  type: TransactionType;
  amount: number;
  currency: TransactionCurrency;
  date: string;
  category_id: string | null;
  payment_method_id: string | null;
  merchant: string | null;
  description: string | null;
};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
