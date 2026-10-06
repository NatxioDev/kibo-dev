"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { buttonClassName } from "@/components/ui/Button";
import type { ReportPeriod } from "@/features/reports/types";
import { currencyName } from "@/features/reports/utils/format";
import type { ExportFormat } from "@/features/transactions/export/domain/models";
import type { TransactionCurrency } from "@/features/transactions/types";

type ExportReportButtonProps = {
  period: ReportPeriod;
  offset: number;
  currency: TransactionCurrency;
  rangeLabel: string;
  disabled: boolean;
};

const FORMAT_OPTIONS: {
  format: ExportFormat;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    format: "xlsx",
    title: "Excel",
    description: "Fechas y montos listos para filtrar y sumar",
    icon: "📊",
  },
  {
    format: "csv",
    title: "CSV",
    description: "Liviano, para Google Sheets u otras apps",
    icon: "📄",
  },
];

const GENERIC_ERROR = "No pudimos generar el archivo. Revisa tu conexión e intenta de nuevo.";

function filenameFromDisposition(header: string | null): string | null {
  return header?.match(/filename="([^"]+)"/)?.[1] ?? null;
}

async function readErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object" && "error" in body) {
    const { error } = body as { error: unknown };
    if (typeof error === "string") return error;
  }
  return GENERIC_ERROR;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ExportReportButton({
  period,
  offset,
  currency,
  rangeLabel,
  disabled,
}: ExportReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openSheet() {
    setError(null);
    setOpen(true);
  }

  async function handleExport(format: ExportFormat) {
    setPending(format);
    setError(null);

    const params = new URLSearchParams({
      format,
      period,
      offset: String(offset),
      currency,
    });

    try {
      const response = await fetch(`/api/export/transactions?${params}`, {
        cache: "no-store",
      });
      if (response.redirected) {
        setError("Tu sesión expiró. Vuelve a iniciar sesión para exportar.");
        return;
      }
      if (!response.ok) {
        setError(await readErrorMessage(response));
        return;
      }
      const blob = await response.blob();
      triggerDownload(
        blob,
        filenameFromDisposition(response.headers.get("Content-Disposition")) ??
          `kibo-transacciones.${format}`,
      );
      setOpen(false);
    } catch {
      setError(GENERIC_ERROR);
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openSheet}
        aria-haspopup="dialog"
        className={buttonClassName({ variant: "secondary", size: "sm", className: "shrink-0" })}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 4v11" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
        Exportar
      </button>

      <BottomSheet
        open={open}
        title="Exportar movimientos"
        description={`${rangeLabel} · ${currencyName(currency)}`}
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col gap-3 pb-2">
          <p aria-live="polite" className="sr-only">
            {pending ? "Generando archivo…" : ""}
          </p>
          <div aria-live="polite" className="empty:hidden">
            {error ? <Alert>{error}</Alert> : null}
          </div>

          <ul className="flex flex-col gap-1">
            {FORMAT_OPTIONS.map((option) => {
              const isPending = pending === option.format;
              return (
                <li key={option.format}>
                  <button
                    type="button"
                    disabled={pending !== null}
                    onClick={() => handleExport(option.format)}
                    aria-busy={isPending}
                    className="flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-[background-color,opacity] hover:bg-surface-muted active:bg-surface-muted disabled:opacity-60"
                  >
                    <span aria-hidden className="text-2xl">
                      {option.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-foreground">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-pretty text-muted-foreground">
                        {isPending ? "Generando archivo…" : option.description}
                      </span>
                    </span>
                    {isPending ? (
                      <span
                        aria-hidden
                        className="h-5 w-5 shrink-0 rounded-full border-2 border-track border-t-primary motion-safe:animate-spin"
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        aria-hidden
                      >
                        <path d="M12 4v11" />
                        <path d="m7 10 5 5 5-5" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="px-1 text-xs text-pretty text-muted-foreground">
            Una fila por movimiento: fecha, tipo, monto, categoría, comercio, nota, cuenta y método
            de pago.
          </p>
        </div>
      </BottomSheet>
    </>
  );
}
