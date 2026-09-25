import type {
  Transaction,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";

export type TransactionRow = Omit<Transaction, "amount"> & {
  amount: number | string;
};

export type TransactionWithRelationsRow = Omit<
  TransactionWithRelations,
  "amount"
> & {
  amount: number | string;
};

export function toTransaction(row: TransactionRow): Transaction {
  return {
    ...row,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
  };
}

export function toTransactionWithRelations(
  row: TransactionWithRelationsRow,
): TransactionWithRelations {
  return {
    ...row,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
  };
}
