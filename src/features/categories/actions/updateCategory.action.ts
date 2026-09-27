"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { UpdateCategory } from "@/features/categories/application/UpdateCategory.application";
import { categoryFormSchema } from "@/features/categories/schemas/categorySchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";

type CategoryFormValues = {
  name: string;
  icon: string;
  type: "EXPENSE" | "INCOME";
};

export async function updateCategoryAction(
  id: string,
  values: CategoryFormValues,
): Promise<ServiceResult<{ id: string }>> {
  // Validación de entrada en el servidor
  const parsed = categoryFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos de la categoría no son válidos.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { categoryRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new UpdateCategory(categoryRepository).execute(
    id,
    parsed.data,
  );

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/settings/categories");
    revalidatePath(`/settings/categories/${id}`);
  }

  return result;
}
