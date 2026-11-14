import type {
  PaymentQrRepository,
  SavePaymentQrCommand,
} from "@/features/payment-qr/domain/PaymentQr.repository";
import { parseManualExpiry, parsePaymentQrLabel } from "@/features/payment-qr/domain/fields";
import type { PaymentQrMutationResult } from "@/features/payment-qr/domain/models";
import { validatePaymentQrFile } from "@/features/payment-qr/domain/validatePaymentQrFile";

export class SavePaymentQr {
  constructor(private readonly paymentQrRepository: PaymentQrRepository) {}

  execute(input: {
    bytes: Uint8Array | null;
    label: string;
    manualExpiresOn: string;
    consent: boolean;
  }): Promise<PaymentQrMutationResult> {
    const label = parsePaymentQrLabel(input.label);
    if (!label.ok) return Promise.resolve({ success: false, error: label.error });

    const expiry = parseManualExpiry(input.manualExpiresOn);
    if (!expiry.ok) return Promise.resolve({ success: false, error: expiry.error });

    const command: SavePaymentQrCommand = {
      bytes: null,
      mime: null,
      extension: null,
      label: label.label,
      manualExpiresOn: expiry.date,
      consent: input.consent,
    };

    if (input.bytes) {
      const file = validatePaymentQrFile(input.bytes);
      if (!file.ok) return Promise.resolve({ success: false, error: file.error });
      command.bytes = input.bytes;
      command.mime = file.mime;
      command.extension = file.extension;
    }

    return this.paymentQrRepository.save(command);
  }
}
