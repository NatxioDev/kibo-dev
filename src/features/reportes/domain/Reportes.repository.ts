import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  TransactionCurrency,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";

export type ReportesQuery = {
  currency: TransactionCurrency;
  from: string;
  to: string;
};

export interface ReportesRepository {
  listConfirmedInRange(
    query: ReportesQuery
  ): Promise<ServiceResult<TransactionWithRelations[]>>;
}
