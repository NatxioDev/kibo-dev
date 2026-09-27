"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { UpdateSharedExpense } from "@/features/splits/application/UpdateSharedExpense.application";
import { UpdateTransaction } from "@/features/transactions/application/UpdateTransaction.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { TransactionFormValues } from "@/features/transactions/domain/models";
import type { SplitDraft } from "@/features/splits/domain/models";
import { splitDraftSchema } from "@/features/splits/schemas/splitSchema";
import { transactionFormSchema } from "@/features/transactions/schemas/transactionSchema";

function revalidateMoneyPaths(id?: string) {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/friends", "layout");
  if (id) revalidatePath(`/transactions/${id}`);
}

export async function updateTransactionAction(
  id: string,
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

  const draftParsed = split ? splitDraftSchema.safeParse(split) : null;
  if (draftParsed && !draftParsed.success) {
    return {
      success: false,
      error: draftParsed.error.issues[0]?.message ?? "El reparto no es válido.",
    };
  }

  const { transactionRepository, splitRepository } = await createServerDependencies();
  const result = await new UpdateTransaction(
    transactionRepository,
    splitRepository,
  ).execute(id, parsed.data, draftParsed?.data ?? null);

  if (!result.success) return result;

  revalidateMoneyPaths(result.data.id);
  return { success: true, data: { id: result.data.id } };
}

export async function updateSharedExpenseAction(
  expenseId: string,
  values: TransactionFormValues,
  split: SplitDraft,
): Promise<ServiceResult<{ id: string | null }>> {
  const parsed = transactionFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos de la transacción no son válidos.",
    };
  }

  const draft = splitDraftSchema.safeParse(split);
  if (!draft.success) {
    return {
      success: false,
      error: draft.error.issues[0]?.message ?? "El reparto no es válido.",
    };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new UpdateSharedExpense(splitRepository).execute(
    expenseId,
    parsed.data,
    draft.data,
  );
  if (!result.success) return result;

  revalidateMoneyPaths(result.data.transactionId ?? undefined);
  return { success: true, data: { id: result.data.transactionId } };
}
