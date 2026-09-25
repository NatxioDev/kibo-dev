import type {
  ServiceResult,
  TransactionCurrency,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";

export type DashboardQuery = {
  currency: TransactionCurrency;
  from: string;
  to: string;
};

export interface DashboardRepository {
  listConfirmedInRange(
    query: DashboardQuery,
  ): Promise<ServiceResult<TransactionWithRelations[]>>;
}
