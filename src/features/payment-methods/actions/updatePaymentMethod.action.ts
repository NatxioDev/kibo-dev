"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { UpdatePaymentMethod } from "@/features/payment-methods/application/UpdatePaymentMethod.application";
import { paymentMethodFormSchema } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type { ServiceResult } from "@/features/transactions/domain/models";

type PaymentMethodFormValues = {
  name: string;
};

export async function updatePaymentMethodAction(
  id: string,
  values: PaymentMethodFormValues,
): Promise<ServiceResult<{ id: string }>> {
  // Validación de entrada en el servidor
  const parsed = paymentMethodFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos del método de pago no son válidos.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { paymentMethodRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new UpdatePaymentMethod(paymentMethodRepository).execute(
    id,
    parsed.data,
  );

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/settings/payment-methods");
    revalidatePath(`/settings/payment-methods/${id}`);
  }

  return result;
}
