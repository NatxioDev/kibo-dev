"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { SetPaymentMethodActive } from "@/features/payment-methods/application/SetPaymentMethodActive.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";

// Validación con zod
const setPaymentMethodActiveSchema = z.object({
  id: z.string().uuid("ID de método de pago inválido"),
  isActive: z.boolean(),
});

export async function setPaymentMethodActiveAction(
  id: string,
  isActive: boolean,
): Promise<ServiceResult<{ id: string }>> {
  // Validación de entrada en el servidor
  const parsed = setPaymentMethodActiveSchema.safeParse({ id, isActive });
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos para activar/desactivar el método de pago no son válidos.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { paymentMethodRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new SetPaymentMethodActive(
    paymentMethodRepository,
  ).execute(parsed.data.id, parsed.data.isActive);

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/settings/payment-methods");
  }

  return result;
}
