"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CreatePaymentMethod } from "@/features/payment-methods/application/CreatePaymentMethod.application";
import { paymentMethodFormSchema } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";

type PaymentMethodFormValues = {
  name: string;
};

export async function createPaymentMethodAction(
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
  const result = await new CreatePaymentMethod(paymentMethodRepository).execute(
    parsed.data,
  );

  if (result.success) {
    // Revalidar las rutas relevantes
    revalidatePath("/");
    revalidatePath("/settings/payment-methods");
  }

  return result;
}
