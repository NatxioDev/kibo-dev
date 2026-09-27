"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { SetCategoryActive } from "@/features/categories/application/SetCategoryActive.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";

// Validación con zod
const setCategoryActiveSchema = z.object({
  id: z.string().uuid("ID de categoría inválido"),
  isActive: z.boolean(),
});

export async function setCategoryActiveAction(
  id: string,
  isActive: boolean,
): Promise<ServiceResult<{ id: string }>> {
  // Validación de entrada en el servidor
  const parsed = setCategoryActiveSchema.safeParse({ id, isActive });
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos para activar/desactivar la categoría no son válidos.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { categoryRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new SetCategoryActive(categoryRepository).execute(
    parsed.data.id,
    parsed.data.isActive,
  );

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/settings/categories");
  }

  return result;
}
