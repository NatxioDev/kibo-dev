import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import {
  PAYMENT_QR_BUCKET,
  PAYMENT_QR_CONSENT_VERSION,
  PAYMENT_QR_SIGNED_URL_SECONDS,
} from "@/features/payment-qr/domain/constants";
import type {
  PaymentQrRepository,
  SavePaymentQrCommand,
} from "@/features/payment-qr/domain/PaymentQr.repository";
import type {
  PaymentQrImage,
  PaymentQrMutationResult,
  PaymentQrNoticeKind,
  PaymentQrVisibility,
} from "@/features/payment-qr/domain/models";
import { isRecentSignIn } from "@/features/payment-qr/domain/reauth";
import { paymentQrValidity, todayInBolivia } from "@/features/payment-qr/domain/validity";
import { drainPaymentQrPurgeQueue } from "@/features/payment-qr/infrastructure/purgePaymentQrQueue";
import {
  mapPaymentQrMutation,
  mapPaymentQrStorageError,
} from "@/features/payment-qr/infrastructure/supabase/mapPaymentQrError";

const NOT_AUTHENTICATED = "Debes iniciar sesión.";

type QrRow = {
  label: string | null;
  manual_expires_on: string | null;
  uploaded_at: string;
  replaced_at: string | null;
  consent_version: string;
  object_path: string;
};

type NoticeRow = {
  kind: PaymentQrNoticeKind;
  created_at: string;
};

export class SupabasePaymentQrRepository implements PaymentQrRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getForViewer(ownerId: string): Promise<ServiceResult<PaymentQrVisibility>> {
    const user = await this.getUser();
    if (!user) return { success: false, error: NOT_AUTHENTICATED };

    const { data: canSee, error: canError } = await this.supabase.rpc("can_see_payment_qr", {
      p_owner: ownerId,
    });
    if (canError) {
      return { success: false, error: "No pudimos comprobar el acceso al QR." };
    }
    if (!canSee) return { success: true, data: { access: false } };

    const [rowResult, profileResult, noticeResult] = await Promise.all([
      this.supabase
        .from("payment_qrs")
        .select("label, manual_expires_on, uploaded_at, replaced_at, consent_version, object_path")
        .eq("user_id", ownerId)
        .maybeSingle(),
      this.supabase
        .from("profiles")
        .select("display_name, username")
        .eq("id", ownerId)
        .maybeSingle(),
      this.supabase
        .from("payment_qr_notices")
        .select("kind, created_at")
        .eq("owner_id", ownerId)
        .eq("viewer_id", user.id)
        .is("seen_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (rowResult.error) {
      return { success: false, error: "No pudimos cargar el QR." };
    }

    const row = rowResult.data as QrRow | null;
    const notice = noticeResult.data as NoticeRow | null;
    let image: PaymentQrImage | null = null;
    let imageError: string | null = null;

    if (row) {
      const signed = await this.supabase.storage
        .from(PAYMENT_QR_BUCKET)
        .createSignedUrl(row.object_path, PAYMENT_QR_SIGNED_URL_SECONDS);
      if (signed.error || !signed.data?.signedUrl) {
        imageError = "No pudimos mostrar la imagen. Intenta de nuevo.";
      } else {
        image = {
          label: row.label,
          manualExpiresOn: row.manual_expires_on,
          validity: paymentQrValidity(row.manual_expires_on, todayInBolivia(new Date())),
          uploadedAt: row.uploaded_at,
          replacedAt: row.replaced_at,
          signedUrl: signed.data.signedUrl,
          consentVersion: row.consent_version,
        };
      }
    }

    return {
      success: true,
      data: {
        access: true,
        ownerId,
        ownerName: profileName(profileResult.data),
        image,
        notice: notice ? { kind: notice.kind, createdAt: notice.created_at } : null,
        imageError,
      },
    };
  }

  async save(command: SavePaymentQrCommand): Promise<PaymentQrMutationResult> {
    const user = await this.getUser();
    if (!user) return { success: false, error: NOT_AUTHENTICATED };

    let uploadedPath: string | null = null;
    try {
      if (command.bytes) {
        if (!command.mime || !command.extension) {
          return {
            success: false,
            error: "Usa una imagen PNG, JPG o WEBP de hasta 2 MB. Kibo no modifica el archivo.",
          };
        }

        const existing = await this.supabase
          .from("payment_qrs")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (existing.error) {
          return { success: false, error: "No pudimos guardar el QR. Intenta de nuevo." };
        }
        if (existing.data && !isRecentSignIn(user.last_sign_in_at, new Date())) {
          return {
            success: false,
            code: "reauth_required",
            error: "Para reemplazar el QR, confirma que eres tú.",
          };
        }

        uploadedPath = `${user.id}/${randomUUID()}.${command.extension}`;
        const sha256 = createHash("sha256").update(command.bytes).digest("hex");
        const upload = await this.supabase.storage.from(PAYMENT_QR_BUCKET).upload(
          uploadedPath,
          command.bytes,
          { contentType: command.mime, cacheControl: "60", upsert: false },
        );
        if (upload.error) {
          uploadedPath = null;
          return { success: false, error: mapPaymentQrStorageError(upload.error.message) };
        }

        const saved = await this.supabase.rpc("save_payment_qr", {
          p_object_path: uploadedPath,
          p_label: command.label,
          p_mime: command.mime,
          p_size_bytes: command.bytes.byteLength,
          p_sha256: sha256,
          p_manual_expires_on: command.manualExpiresOn,
          p_consent_version: PAYMENT_QR_CONSENT_VERSION,
          p_consent: command.consent,
        });
        if (saved.error) {
          await this.supabase.storage.from(PAYMENT_QR_BUCKET).remove([uploadedPath]);
          return mapPaymentQrMutation(saved.error);
        }

        const previous = readPreviousPath(saved.data);
        if (previous && previous !== uploadedPath) {
          await this.supabase.storage.from(PAYMENT_QR_BUCKET).remove([previous]);
        }
      } else {
        const saved = await this.supabase.rpc("save_payment_qr", {
          p_object_path: null,
          p_label: command.label,
          p_mime: null,
          p_size_bytes: null,
          p_sha256: null,
          p_manual_expires_on: command.manualExpiresOn,
          p_consent_version: PAYMENT_QR_CONSENT_VERSION,
          p_consent: command.consent,
        });
        if (saved.error) return mapPaymentQrMutation(saved.error);
      }

      await drainPaymentQrPurgeQueue();
      return { success: true };
    } catch {
      if (uploadedPath) {
        await this.supabase.storage.from(PAYMENT_QR_BUCKET).remove([uploadedPath]);
      }
      return { success: false, error: "No pudimos guardar el QR. Intenta de nuevo." };
    }
  }

  async remove(): Promise<PaymentQrMutationResult> {
    const user = await this.getUser();
    if (!user) return { success: false, error: NOT_AUTHENTICATED };

    const { data, error } = await this.supabase.rpc("delete_payment_qr");
    if (error) return mapPaymentQrMutation(error);

    if (typeof data === "string" && data.length > 0) {
      await this.supabase.storage.from(PAYMENT_QR_BUCKET).remove([data]);
    }
    await drainPaymentQrPurgeQueue();
    return { success: true };
  }

  async acknowledge(ownerId: string): Promise<ServiceResult<null>> {
    const user = await this.getUser();
    if (!user) return { success: false, error: NOT_AUTHENTICATED };

    const { error } = await this.supabase.rpc("acknowledge_payment_qr_notice", {
      p_owner: ownerId,
    });
    if (error) return { success: false, error: "No pudimos marcar el aviso." };
    return { success: true, data: null };
  }

  private async getUser() {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    return error ? null : user;
  }
}

function profileName(
  profile: { display_name: string | null; username: string | null } | null,
): string {
  const display = profile?.display_name?.trim();
  if (display) return display;
  if (profile?.username) return `@${profile.username}`;
  return "Esta persona";
}

function readPreviousPath(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("previous_path" in data)) return null;
  const value = data.previous_path;
  return typeof value === "string" && value.length > 0 ? value : null;
}
