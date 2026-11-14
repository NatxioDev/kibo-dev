import type { PaymentQrValidity } from "@/features/payment-qr/domain/validity";

export type PaymentQrNoticeKind = "replaced" | "deleted";

export type PaymentQrImage = {
  label: string | null;
  manualExpiresOn: string | null;
  validity: PaymentQrValidity;
  uploadedAt: string;
  replacedAt: string | null;
  signedUrl: string;
  consentVersion: string;
};

export type PaymentQrNotice = {
  kind: PaymentQrNoticeKind;
  createdAt: string;
};

export type PaymentQrVisibility =
  | { access: false }
  | {
      access: true;
      ownerId: string;
      ownerName: string;
      image: PaymentQrImage | null;
      notice: PaymentQrNotice | null;
      imageError: string | null;
    };

export type PaymentQrMutationResult =
  | { success: true }
  | { success: false; error: string; code?: "reauth_required" };
