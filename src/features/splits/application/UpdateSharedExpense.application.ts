import type { TransactionFormValues } from "@/features/transactions/domain/models";
import type { SplitRepository } from "@/features/splits/domain/Split.repository";
import {
  sameSplitAmounts,
  resolveSplitDraft,
} from "@/features/splits/domain/resolveSplit";
import type {
  ResolvedSplit,
  ServiceResult,
  SplitDraft,
  SplitWriteResult,
} from "@/features/splits/domain/models";

export class UpdateSharedExpense {
  constructor(private readonly splitRepository: SplitRepository) {}

  async execute(
    expenseId: string,
    values: TransactionFormValues,
    draft: SplitDraft,
  ): Promise<ServiceResult<SplitWriteResult>> {
    if (values.type !== "EXPENSE") {
      return {
        success: false,
        error: "Un gasto compartido sigue siendo un gasto. Elimínalo si ya no quieres dividirlo.",
      };
    }

    const current = await this.splitRepository.getEditContext(expenseId);
    if (!current.success) return current;
    if (!current.data.isPayer) {
      return { success: false, error: "Solo quien pagó puede cambiar este gasto." };
    }

    const resolved = resolveSplitDraft({
      totalAmount: values.amount,
      currency: values.currency,
      date: values.date,
      merchant: values.merchant,
      description: values.description,
      categoryId: values.category_id,
      paymentMethodId: values.payment_method_id,
      draft,
    });
    if (!resolved.ok) return { success: false, error: resolved.error };

    if (sameSplitAmounts(current.data, resolved.split)) {
      const details = await this.splitRepository.updateExpenseDetails(expenseId, {
        date: values.date,
        merchant: values.merchant,
        description: values.description,
        categoryId: values.category_id,
        paymentMethodId: values.payment_method_id,
      });
      if (!details.success) return details;
      return {
        success: true,
        data: {
          expenseId,
          transactionId: current.data.transactionId,
        },
      };
    }

    if (current.data.amountsLocked) {
      return {
        success: false,
        error: "Ya hay un pago confirmado con esta persona. No puedes cambiar el monto.",
      };
    }

    return this.splitRepository.replaceExpense(expenseId, resolved.split);
  }
}

export type { ResolvedSplit };
