"use server";

import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListActiveCategoriesByType } from "@/features/categories/application/ListActiveCategoriesByType.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Category, TransactionType } from "@/features/transactions/domain/models";

// Validación del tipo de transacción con zod
const listCategoriesSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
});

export async function listActiveCategoriesByTypeAction(
  type: TransactionType,
): Promise<ServiceResult<Category[]>> {
  // Validación de entrada en el servidor
  const parsed = listCategoriesSchema.safeParse({ type });
  if (!parsed.success) {
    return {
      success: false,
      error: "El tipo de transacción no es válido.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { categoryRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new ListActiveCategoriesByType(categoryRepository).execute(
    parsed.data.type,
  );

  return result;
}
