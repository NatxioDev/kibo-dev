import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { PaymentQrExtension, PaymentQrMime } from "@/features/payment-qr/domain/constants";
import type {
  PaymentQrMutationResult,
  PaymentQrVisibility,
} from "@/features/payment-qr/domain/models";

export type SavePaymentQrCommand = {
  bytes: Uint8Array | null;
  mime: PaymentQrMime | null;
  extension: PaymentQrExtension | null;
  label: string | null;
  manualExpiresOn: string | null;
  consent: boolean;
};

export interface PaymentQrRepository {
  getForViewer(ownerId: string): Promise<ServiceResult<PaymentQrVisibility>>;
  save(command: SavePaymentQrCommand): Promise<PaymentQrMutationResult>;
  remove(): Promise<PaymentQrMutationResult>;
  acknowledge(ownerId: string): Promise<ServiceResult<null>>;
}
