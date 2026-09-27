import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Transaction,
  TransactionFormValues,
} from "@/features/transactions/domain/models";

export class CreateTransaction {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute(
    values: TransactionFormValues,
  ): Promise<ServiceResult<Transaction>> {
    return this.transactionRepository.create(values);
  }
}
