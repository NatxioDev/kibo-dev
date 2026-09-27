import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import type { PaymentMethodFormValues } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  PaymentMethod,
} from "@/features/transactions/domain/models";

export class UpdatePaymentMethod {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  execute(
    id: string,
    values: PaymentMethodFormValues,
  ): Promise<ServiceResult<PaymentMethod>> {
    return this.paymentMethodRepository.update(id, values);
  }
}
