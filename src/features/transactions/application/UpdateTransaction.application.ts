import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Transaction,
  TransactionFormValues,
} from "@/features/transactions/domain/models";

export class UpdateTransaction {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute(
    id: string,
    values: TransactionFormValues,
  ): Promise<ServiceResult<Transaction>> {
    return this.transactionRepository.update(id, values);
  }
}
