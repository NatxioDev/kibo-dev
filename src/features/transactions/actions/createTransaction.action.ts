"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CreateTransaction } from "@/features/transactions/application/CreateTransaction.application";
import type { ServiceResult } from "@/features/transactions/domain/models";
import { transactionFormSchema } from "@/features/transactions/schemas/transactionSchema";
import type { TransactionFormValues } from "@/features/transactions/domain/models";

export async function createTransactionAction(
  values: TransactionFormValues,
): Promise<ServiceResult<{ id: string }>> {
  // Validación de entrada en el servidor
  const parsed = transactionFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos de la transacción no son válidos.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { transactionRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new CreateTransaction(transactionRepository).execute(
    parsed.data,
  );

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/transactions");
  }

  return result;
}
