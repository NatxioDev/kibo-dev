import type {
  ServiceResult,
  Transaction,
  TransactionFormValues,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";
import type { ListTransactionsFilters } from "@/features/transactions/utils/listFilters";

export interface TransactionRepository {
  list(
    filters?: ListTransactionsFilters,
  ): Promise<ServiceResult<TransactionWithRelations[]>>;
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
