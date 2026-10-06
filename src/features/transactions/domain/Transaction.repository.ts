import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Transaction,
  TransactionFormValues,
  TransactionPage,
  TransactionPageCursor,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";
import type { ListTransactionsFilters } from "@/features/transactions/utils/listFilters";

export interface TransactionRepository {
  list(
    filters?: ListTransactionsFilters,
  ): Promise<ServiceResult<TransactionWithRelations[]>>;
  listPage(
    filters: ListTransactionsFilters,
    cursor: TransactionPageCursor | null,
    limit: number,
  ): Promise<ServiceResult<TransactionPage>>;
  getById(id: string): Promise<ServiceResult<Transaction>>;
  getByIdWithRelations(
    id: string,
  ): Promise<ServiceResult<TransactionWithRelations>>;
  create(
    values: TransactionFormValues,
  ): Promise<ServiceResult<Transaction>>;
  update(
    id: string,
    values: TransactionFormValues,
  ): Promise<ServiceResult<Transaction>>;
  delete(id: string): Promise<ServiceResult<null>>;
}
