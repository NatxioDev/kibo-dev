import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class GetPaymentMethod {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  execute(id: string): Promise<ServiceResult<PaymentMethod>> {
    return this.paymentMethodRepository.getById(id);
  }
}
