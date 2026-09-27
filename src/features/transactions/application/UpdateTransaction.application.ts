import type {
  ServiceResult,
  Transaction,
  TransactionFormValues,
} from "@/features/transactions/domain/models";
import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import { UpdateSharedExpense } from "@/features/splits/application/UpdateSharedExpense.application";
import type { SplitDraft } from "@/features/splits/domain/models";
import type { SplitRepository } from "@/features/splits/domain/Split.repository";
import { toCents } from "@/features/splits/domain/splitAmount";

export class UpdateTransaction {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly splitRepository: SplitRepository,
  ) {}

  async execute(
    id: string,
    values: TransactionFormValues,
    draft: SplitDraft | null = null,
  ): Promise<ServiceResult<Transaction | { id: string }>> {
    const link = await this.splitRepository.findByTransaction(id);
    if (!link.success) return link;

    if (!link.data) {
      return this.transactionRepository.update(id, values);
    }

    if (!link.data.isPayer) {
      if (
        toCents(values.amount) !== toCents(link.data.shareAmount) ||
        values.currency !== link.data.currency ||
        values.type !== "EXPENSE"
      ) {
        return {
          success: false,
          error:
            "Solo quien pagó puede cambiar el monto. Tú puedes cambiar la categoría y la nota.",
        };
      }

      return this.transactionRepository.update(id, {
        ...values,
        amount: link.data.shareAmount,
        currency: link.data.currency,
        type: "EXPENSE",
      });
    }

    if (!draft) {
      return {
        success: false,
        error: "Falta el reparto de este gasto compartido.",
      };
    }

    const updated = await new UpdateSharedExpense(this.splitRepository).execute(
      link.data.expenseId,
      values,
      draft,
    );
    if (!updated.success) return updated;

    return {
      success: true,
      data: { id: updated.data.transactionId ?? id },
    };
  }
}
