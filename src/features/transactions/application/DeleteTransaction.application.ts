import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type { ServiceResult } from "@/features/transactions/domain/models";

export class DeleteTransaction {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  execute(id: string): Promise<ServiceResult<null>> {
    return this.transactionRepository.delete(id);
  }
}
