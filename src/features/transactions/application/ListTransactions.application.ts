import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type {
  ServiceResult,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";
import type { ListTransactionsFilters } from "@/features/transactions/utils/listFilters";

export class ListTransactions {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute(
    filters: ListTransactionsFilters = {},
  ): Promise<ServiceResult<TransactionWithRelations[]>> {
    return this.transactionRepository.list(filters);
  }
}
