import type { PaymentMethodFormValues } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type {
  PaymentMethod,
  ServiceResult,
} from "@/features/transactions/domain/models";

export interface PaymentMethodRepository {
  list(): Promise<ServiceResult<PaymentMethod[]>>;
  listActive(): Promise<ServiceResult<PaymentMethod[]>>;
  getById(id: string): Promise<ServiceResult<PaymentMethod>>;
  create(
    values: PaymentMethodFormValues,
  ): Promise<ServiceResult<PaymentMethod>>;
  update(
    id: string,
    values: PaymentMethodFormValues,
  ): Promise<ServiceResult<PaymentMethod>>;
  setActive(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResult<PaymentMethod>>;
}
