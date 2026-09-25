import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class SetPaymentMethodActive {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  execute(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResult<PaymentMethod>> {
    return this.paymentMethodRepository.setActive(id, isActive);
  }
}
