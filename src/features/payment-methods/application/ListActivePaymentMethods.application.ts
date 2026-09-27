import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  PaymentMethod,
} from "@/features/transactions/domain/models";

export class ListActivePaymentMethods {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  execute(): Promise<ServiceResult<PaymentMethod[]>> {
    return this.paymentMethodRepository.listActive();
  }
}
