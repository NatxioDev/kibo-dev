"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { Portal } from "@/components/ui/Portal";
import { acknowledgePaymentQrNoticeAction } from "@/features/payment-qr/actions/paymentQr.action";
import {
  PAYMENT_QR_AFTER_PAY,
  PAYMENT_QR_REMINDER,
  PAYMENT_QR_SAVE_NOTE,
  PAYMENT_QR_VERIFY_NOTE,
  paymentQrAmountHint,
  paymentQrDeletedNotice,
  paymentQrEmptyForDebtor,
  paymentQrReplacedNotice,
  paymentQrUploaderLine,
  paymentQrValidityMessage,
} from "@/features/payment-qr/domain/copy";
import { formatQrDay, formatQrTimestamp } from "@/features/payment-qr/domain/format";
import type { PaymentQrImage, PaymentQrNotice } from "@/features/payment-qr/domain/models";

type PaymentQrViewerProps = {
  ownerId: string;
  ownerName: string;
  viewerIsOwner: boolean;
  image: PaymentQrImage | null;
  notice: PaymentQrNotice | null;
  imageError: string | null;
  balanceHint: string | null;
};

export function PaymentQrViewer({
  ownerId,
  ownerName,
  viewerIsOwner,
  image,
  notice,
  imageError,
  balanceHint,
}: PaymentQrViewerProps) {
  const [revealed, setRevealed] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

  useEffect(() => {
    if (!notice || viewerIsOwner) return;
    void acknowledgePaymentQrNoticeAction(ownerId);
  }, [notice, ownerId, viewerIsOwner]);

  if (!image && !imageError && !notice) {
    if (viewerIsOwner) return null;
    return (
      <EmptyState
        icon="▣"
        title="Todavía no hay un QR"
        description={paymentQrEmptyForDebtor(ownerName)}
      />
    );
  }

  const when = image
    ? formatQrTimestamp(image.replacedAt ?? image.uploadedAt)
    : notice
      ? formatQrTimestamp(notice.createdAt)
      : "";
  const expired = image?.validity === "vencido" && !revealed;

  return (
    <Card className="flex flex-col gap-4 px-5 py-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg font-extrabold tracking-[-0.03em] text-foreground">
          QR de {viewerIsOwner ? "cobro" : ownerName}
        </h2>
        {image?.label ? (
          <p className="text-sm text-muted-foreground">{image.label}</p>
        ) : null}
      </div>

      {notice && !viewerIsOwner ? (
        <Alert tone="info">
          {notice.kind === "deleted"
            ? paymentQrDeletedNotice(ownerName, formatQrTimestamp(notice.createdAt))
            : paymentQrReplacedNotice(ownerName, formatQrTimestamp(notice.createdAt))}
        </Alert>
      ) : null}

      {imageError ? <Alert>{imageError}</Alert> : null}

      {image ? (
        <>
          <p
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${validityClass(image.validity)}`}
          >
            {validityName(image.validity)}
          </p>
          <p className="text-sm text-pretty text-foreground">
            {paymentQrValidityMessage(
              image.validity,
              image.manualExpiresOn ? formatQrDay(image.manualExpiresOn) : null,
              ownerName,
              viewerIsOwner,
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            {paymentQrUploaderLine(ownerName, when, Boolean(image.replacedAt), viewerIsOwner)}
          </p>

          {expired ? (
            <Button type="button" variant="secondary" onClick={() => setRevealed(true)}>
              Ver de todos modos
            </Button>
          ) : (
            <QrFigure
              src={image.signedUrl}
              alt={`QR de cobro de ${ownerName}`}
              onEnlarge={() => setEnlarged(true)}
            />
          )}

          <p className="text-sm text-pretty text-muted-foreground">{PAYMENT_QR_REMINDER}</p>
          <HowItWorks>
            <p>{PAYMENT_QR_VERIFY_NOTE}</p>
            <p>{paymentQrAmountHint(balanceHint)}</p>
            {!viewerIsOwner ? <p>{PAYMENT_QR_AFTER_PAY}</p> : null}
            <p>{PAYMENT_QR_SAVE_NOTE}</p>
            <p>
              <Link href="/terms#qr-de-cobro" className="font-semibold text-primary">
                Condiciones del QR de cobro
              </Link>
            </p>
          </HowItWorks>

          {!expired ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => setEnlarged(true)}>
                Ampliar
              </Button>
              <a
                href={image.signedUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-semibold text-muted-foreground hover:bg-surface-muted hover:text-foreground"
              >
                Abrir imagen
              </a>
            </div>
          ) : null}
        </>
      ) : null}

      {enlarged && image ? (
        <EnlargeDialog
          src={image.signedUrl}
          alt={`QR de cobro de ${ownerName}, ampliado`}
          onClose={() => setEnlarged(false)}
        />
      ) : null}
    </Card>
  );
}

function QrFigure({
  src,
  alt,
  onEnlarge,
}: {
  src: string;
  alt: string;
  onEnlarge: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEnlarge}
      className="mx-auto flex w-full max-w-80 items-center justify-center rounded-2xl bg-white p-4"
    >
      {/* La imagen se muestra tal cual. No pasa por el optimizador. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={320}
        height={320}
        referrerPolicy="no-referrer"
        draggable={false}
        className="h-auto w-full max-w-72 object-contain"
      />
    </button>
  );
}

function EnlargeDialog({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="flex w-full max-w-lg flex-col gap-4 rounded-[2rem] bg-white p-4"
        >
          <h2 id={titleId} className="px-2 text-center text-sm font-semibold text-neutral-700">
            Acerca la cámara de tu banco
          </h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={480}
            height={480}
            referrerPolicy="no-referrer"
            className="h-auto w-full object-contain"
          />
          <Button type="button" variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Portal>
  );
}

function validityName(validity: PaymentQrImage["validity"]): string {
  if (validity === "vigente") return "Vigente";
  if (validity === "vencido") return "Vencido";
  return "Vigencia desconocida";
}

function validityClass(validity: PaymentQrImage["validity"]): string {
  if (validity === "vigente") return "bg-income/15 text-income";
  if (validity === "vencido") return "bg-expense-soft text-expense-strong";
  return "bg-surface-muted text-muted-foreground";
}
