import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type {
  ServiceResult,
  Transaction,
  TransactionWithRelations,
} from "@/features/transactions/domain/models";

export class GetTransaction {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute(id: string): Promise<ServiceResult<Transaction>> {
    return this.transactionRepository.getById(id);
  }
}

export class GetTransactionWithRelations {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute(id: string): Promise<ServiceResult<TransactionWithRelations>> {
    return this.transactionRepository.getByIdWithRelations(id);
  }
}
