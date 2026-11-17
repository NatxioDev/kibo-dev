"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { inputClassName, labelClassName } from "@/components/ui/Field";
import { Portal } from "@/components/ui/Portal";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import {
  deletePaymentQrAction,
  savePaymentQrAction,
} from "@/features/payment-qr/actions/paymentQr.action";
import { PaymentQrViewer } from "@/features/payment-qr/components/PaymentQrViewer";
import { PAYMENT_QR_CONSENT_VERSION } from "@/features/payment-qr/domain/constants";
import {
  PAYMENT_QR_CONSENT_TEXT,
  PAYMENT_QR_DELETE_DESCRIPTION,
  PAYMENT_QR_DELETE_TITLE,
  PAYMENT_QR_FILE_HINT,
  PAYMENT_QR_GOOGLE_REAUTH_NOTE,
  PAYMENT_QR_REPLACE_WARNING,
  PAYMENT_QR_UPLOAD_INTRO,
} from "@/features/payment-qr/domain/copy";
import type { PaymentQrImage } from "@/features/payment-qr/domain/models";
import { createClient } from "@/lib/supabase/client";

type PaymentQrSettingsProps = {
  currentUserId: string;
  ownerName: string;
  image: PaymentQrImage | null;
  imageError: string | null;
};

export function PaymentQrSettings({
  currentUserId,
  ownerName,
  image,
  imageError,
}: PaymentQrSettingsProps) {
  const router = useRouter();
  const needsConsent = !image || image.consentVersion !== PAYMENT_QR_CONSENT_VERSION;
  const formKey = [
    image?.uploadedAt ?? "new",
    image?.replacedAt ?? "",
    image?.label ?? "",
    image?.manualExpiresOn ?? "",
    image?.consentVersion ?? "",
  ].join("|");

  return (
    <div className="flex flex-col gap-4">
      {image || imageError ? (
        <PaymentQrViewer
          ownerId={currentUserId}
          ownerName={ownerName}
          viewerIsOwner
          image={image}
          notice={null}
          imageError={imageError}
          balanceHint={null}
        />
      ) : null}
      <PaymentQrForm
        key={formKey}
        currentUserId={currentUserId}
        hasImage={Boolean(image)}
        needsConsent={needsConsent}
        initialLabel={image?.label ?? ""}
        initialExpiry={image?.manualExpiresOn ?? ""}
        onSaved={() => router.refresh()}
      />
      {image ? <DeleteQrButton onDeleted={() => router.refresh()} /> : null}
    </div>
  );
}

function PaymentQrForm({
  currentUserId,
  hasImage,
  needsConsent,
  initialLabel,
  initialExpiry,
  onSaved,
}: {
  currentUserId: string;
  hasImage: boolean;
  needsConsent: boolean;
  initialLabel: string;
  initialExpiry: string;
  onSaved: () => void;
}) {
  const { authRepository } = useDependencyContext();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reauthOpen, setReauthOpen] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);
  const [pendingForm, setPendingForm] = useState<FormData | null>(null);
  const [consent, setConsent] = useState(false);

  function submitForm(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await savePaymentQrAction(formData);
      if (!result.success) {
        if (result.code === "reauth_required") {
          setPendingForm(formData);
          setReauthError(null);
          setReauthOpen(true);
          return;
        }
        setError(result.error);
        return;
      }
      setReauthOpen(false);
      setPendingForm(null);
      onSaved();
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");
    const hasFile = file instanceof File && file.size > 0;
    if (!hasImage && !hasFile) {
      setError("Elige la imagen que te dio tu banco.");
      return;
    }
    if (needsConsent && !consent) {
      setError("Para guardar el QR, acepta el consentimiento.");
      return;
    }
    if (hasFile && needsConsent) formData.set("consent", "on");
    submitForm(formData);
  }

  function confirmWithPasskey() {
    if (!pendingForm) return;
    const formData = pendingForm;
    setReauthError(null);
    startTransition(async () => {
      const result = await authRepository.signInWithPasskey();
      if (!result.success) {
        setReauthError(result.error);
        return;
      }
      const { data } = await createClient().auth.getUser();
      if (data.user?.id !== currentUserId) {
        setReauthError("Entraste con otra cuenta. Vuelve a entrar con la tuya.");
        return;
      }
      const saved = await savePaymentQrAction(formData);
      if (!saved.success) {
        if (saved.code === "reauth_required") {
          setReauthError(saved.error);
          return;
        }
        setReauthOpen(false);
        setError(saved.error);
        return;
      }
      setReauthOpen(false);
      setPendingForm(null);
      onSaved();
    });
  }

  function confirmWithGoogle() {
    setReauthError(null);
    startTransition(async () => {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/settings/qr")}`;
      const result = await authRepository.signInWithGoogle(redirectTo);
      if (!result.success) setReauthError(result.error);
    });
  }

  return (
    <>
      <Card as="form" onSubmit={onSubmit} className="flex flex-col gap-4 px-5 py-5">
        <p className="text-sm text-pretty text-muted-foreground">{PAYMENT_QR_UPLOAD_INTRO}</p>
        <div className="flex flex-col gap-2">
          <label htmlFor="payment-qr-file" className={labelClassName}>
            Imagen
          </label>
          <input
            id="payment-qr-file"
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={pending}
            className="text-sm text-foreground file:mr-3 file:rounded-control file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-sm file:font-semibold file:text-foreground"
          />
          <p className="text-sm text-muted-foreground">{PAYMENT_QR_FILE_HINT}</p>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="payment-qr-label" className={labelClassName}>
            Etiqueta (opcional)
          </label>
          <input
            id="payment-qr-label"
            name="label"
            type="text"
            maxLength={40}
            defaultValue={initialLabel}
            disabled={pending}
            placeholder="Por ejemplo, el nombre del banco"
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="payment-qr-expires" className={labelClassName}>
            Vigencia manual (opcional)
          </label>
          <input
            id="payment-qr-expires"
            name="manualExpiresOn"
            type="date"
            defaultValue={initialExpiry}
            min="2000-01-01"
            max="2100-12-31"
            disabled={pending}
            className={inputClassName}
          />
          <p className="text-sm text-muted-foreground">
            Kibo no lee la imagen. El estado Vigente, Vencido o Vigencia desconocida sale solo de esta fecha.
          </p>
        </div>
        {needsConsent ? (
          <label className="flex items-start gap-3 text-sm text-pretty text-foreground">
            <input
              type="checkbox"
              name="consent"
              checked={consent}
              disabled={pending}
              onChange={(event) => setConsent(event.target.checked)}
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span>
              {PAYMENT_QR_CONSENT_TEXT}{" "}
              <Link href="/privacy#qr-de-cobro" className="font-semibold text-primary">
                Ver la política de privacidad
              </Link>
            </span>
          </label>
        ) : (
          <p className="text-sm text-pretty text-muted-foreground">
            Ya aceptaste guardar la imagen solo para mostrarla a quienes te deben. Puedes quitarla cuando quieras.
          </p>
        )}
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" loading={pending} disabled={reauthOpen}>
          {pending ? "Guardando…" : hasImage ? "Guardar cambios" : "Subir QR"}
        </Button>
      </Card>

      {reauthOpen ? (
        <Portal>
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reauth-qr-title"
            className="w-full max-w-sm rounded-[2rem] border border-border bg-surface p-6 shadow-card"
          >
            <h2 id="reauth-qr-title" className="font-display text-xl font-extrabold text-foreground">
              Confirma que eres tú
            </h2>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{PAYMENT_QR_REPLACE_WARNING}</p>
            <p className="mt-2 text-sm text-pretty text-muted-foreground">{PAYMENT_QR_GOOGLE_REAUTH_NOTE}</p>
            {reauthError ? <p className="mt-3 text-sm text-expense">{reauthError}</p> : null}
            <div className="mt-5 flex flex-col gap-2">
              <Button type="button" onClick={confirmWithPasskey} loading={pending}>
                {pending ? "Confirmando…" : "Confirmar con Passkey"}
              </Button>
              <Button type="button" variant="secondary" onClick={confirmWithGoogle} disabled={pending}>
                Confirmar con Google
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setReauthOpen(false);
                  setPendingForm(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
        </Portal>
      ) : null}
    </>
  );
}

function DeleteQrButton({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await deletePaymentQrAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setOpen(false);
      onDeleted();
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Eliminar QR
      </Button>
      <ConfirmDialog
        open={open}
        title={PAYMENT_QR_DELETE_TITLE}
        description={PAYMENT_QR_DELETE_DESCRIPTION}
        confirmLabel="Eliminar QR"
        pendingLabel="Eliminando…"
        loading={pending}
        error={error}
        onConfirm={confirm}
        onClose={() => {
          if (!pending) setOpen(false);
        }}
      />
    </>
  );
}
