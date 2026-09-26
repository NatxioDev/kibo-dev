"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListActivePaymentMethods } from "@/features/payment-methods/application/ListActivePaymentMethods.application";
import type { PaymentMethod, ServiceResult } from "@/features/transactions/domain/models";

export async function listActivePaymentMethodsAction(): Promise<
  ServiceResult<PaymentMethod[]>
> {
  // Obtener dependencias del servidor (incluye autenticación)
  const { paymentMethodRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new ListActivePaymentMethods(paymentMethodRepository).execute();

  return result;
}
