"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CreateSharedExpense } from "@/features/splits/application/CreateSharedExpense.application";
import { CreateTransaction } from "@/features/transactions/application/CreateTransaction.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { TransactionFormValues } from "@/features/transactions/domain/models";
import { resolveSplitDraft } from "@/features/splits/domain/resolveSplit";
import type { SplitDraft } from "@/features/splits/domain/models";
import { splitDraftSchema } from "@/features/splits/schemas/splitSchema";
import { transactionFormSchema } from "@/features/transactions/schemas/transactionSchema";

function revalidateMoneyPaths() {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/friends", "layout");
}

export async function createTransactionAction(
  values: TransactionFormValues,
  split: SplitDraft | null = null,
): Promise<ServiceResult<{ id: string | null }>> {
  const parsed = transactionFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos de la transacción no son válidos.",
    };
  }

  const { transactionRepository, splitRepository, accountRepository } =
    await createServerDependencies();

  // Nuevas transacciones deben asociarse a una cuenta activa cuando el usuario ya tiene cuentas.
  const activeAccounts = await accountRepository.listActive();
  if (activeAccounts.success && activeAccounts.data.length > 0) {
    if (!parsed.data.account_id) {
      return { success: false, error: "Selecciona una cuenta." };
    }
    const owned = activeAccounts.data.some(
      (account) => account.id === parsed.data.account_id,
    );
    if (!owned) {
      return {
        success: false,
        error: "La cuenta seleccionada no está disponible.",
      };
    }
  }

  if (split && parsed.data.type === "EXPENSE") {
    const draft = splitDraftSchema.safeParse(split);
    if (!draft.success) {
      return {
        success: false,
        error: draft.error.issues[0]?.message ?? "El reparto no es válido.",
      };
    }

    const resolved = resolveSplitDraft({
      totalAmount: parsed.data.amount,
      currency: parsed.data.currency,
      date: parsed.data.date,
      merchant: parsed.data.merchant,
      description: parsed.data.description,
      categoryId: parsed.data.category_id,
      paymentMethodId: parsed.data.payment_method_id,
      draft: draft.data,
    });
    if (!resolved.ok) return { success: false, error: resolved.error };

    const result = await new CreateSharedExpense(splitRepository).execute(resolved.split);
    if (!result.success) return result;

    revalidateMoneyPaths();
    return { success: true, data: { id: result.data.transactionId } };
  }

  const result = await new CreateTransaction(transactionRepository).execute(parsed.data);
  if (!result.success) return result;

  revalidateMoneyPaths();
  return { success: true, data: { id: result.data.id } };
}
