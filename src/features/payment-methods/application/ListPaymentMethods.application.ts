import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class ListPaymentMethods {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  execute(): Promise<ServiceResult<PaymentMethod[]>> {
    return this.paymentMethodRepository.list();
  }
}
