"use server";

import { revalidatePath } from "next/cache";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { SavePaymentQr } from "@/features/payment-qr/application/SavePaymentQr.application";
import { PAYMENT_QR_MAX_BYTES } from "@/features/payment-qr/domain/constants";
import type { PaymentQrMutationResult } from "@/features/payment-qr/domain/models";

const FILE_ERROR =
  "Usa una imagen PNG, JPG o WEBP de hasta 2 MB. Kibo no modifica el archivo.";

export async function savePaymentQrAction(
  formData: FormData,
): Promise<PaymentQrMutationResult> {
  const file = formData.get("file");
  const label = stringField(formData.get("label"));
  const manualExpiresOn = stringField(formData.get("manualExpiresOn"));
  const consent = formData.get("consent") === "on" || formData.get("consent") === "true";

  let bytes: Uint8Array | null = null;
  if (file instanceof File && file.size > 0) {
    if (file.size > PAYMENT_QR_MAX_BYTES) {
      return { success: false, error: FILE_ERROR };
    }
    bytes = new Uint8Array(await file.arrayBuffer());
  }

  const { paymentQrRepository } = await createServerDependencies();
  const result = await new SavePaymentQr(paymentQrRepository).execute({
    bytes,
    label,
    manualExpiresOn,
    consent,
  });

  if (result.success) revalidatePaymentQr();
  return result;
}

export async function deletePaymentQrAction(): Promise<PaymentQrMutationResult> {
  const { paymentQrRepository } = await createServerDependencies();
  const result = await paymentQrRepository.remove();
  if (result.success) revalidatePaymentQr();
  return result;
}

export async function acknowledgePaymentQrNoticeAction(
  ownerId: string,
): Promise<ServiceResult<null>> {
  if (!/^[0-9a-f-]{36}$/i.test(ownerId)) {
    return { success: false, error: "No pudimos marcar el aviso." };
  }
  const { paymentQrRepository } = await createServerDependencies();
  const result = await paymentQrRepository.acknowledge(ownerId);
  if (result.success) revalidatePaymentQr();
  return result;
}

function stringField(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function revalidatePaymentQr() {
  revalidatePath("/settings/qr");
  revalidatePath("/settings/profile");
  revalidatePath("/friends", "layout");
  revalidatePath("/transactions", "layout");
}
