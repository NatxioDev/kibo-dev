import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import type { PaymentMethodFormValues } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  PaymentMethod,
} from "@/features/transactions/domain/models";

export class CreatePaymentMethod {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  execute(
    values: PaymentMethodFormValues,
  ): Promise<ServiceResult<PaymentMethod>> {
    return this.paymentMethodRepository.create(values);
  }
}
