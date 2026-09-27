import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import type { SplitRepository } from "@/features/splits/domain/Split.repository";

export class DeleteTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly splitRepository: SplitRepository,
  ) {}

  async execute(id: string): Promise<ServiceResult<null>> {
    const link = await this.splitRepository.findByTransaction(id);
    if (!link.success) return link;

    if (!link.data) {
      return this.transactionRepository.delete(id);
    }

    if (!link.data.isPayer) {
      return {
        success: false,
        error: "Solo quien pagó puede eliminar este gasto compartido.",
      };
    }

    return this.splitRepository.voidExpense(link.data.expenseId);
  }
}
