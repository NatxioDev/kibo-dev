"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { DeleteTransaction } from "@/features/transactions/application/DeleteTransaction.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";

// Validación del ID con zod
const deleteTransactionSchema = z.object({
  id: z.string().uuid("ID de transacción inválido"),
});

export async function deleteTransactionAction(
  id: string,
): Promise<ServiceResult<null>> {
  // Validación de entrada en el servidor
  const parsed = deleteTransactionSchema.safeParse({ id });
  if (!parsed.success) {
    return {
      success: false,
      error: "El ID de la transacción debe ser un UUID válido.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { transactionRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new DeleteTransaction(transactionRepository).execute(
    parsed.data.id,
  );

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/transactions");
  }

  return result;
}
