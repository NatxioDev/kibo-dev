"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import type { ExportFormat } from "@/features/transactions/export/domain/models";
import type { Account, Category } from "@/features/transactions/types";
import {
  transactionFiltersToSearchParams,
  type TransactionListFilterState,
} from "@/features/transactions/utils/listFilters";
import { getPeriodChipLabel } from "@/features/transactions/utils/period";

type ExportTransactionsButtonProps = {
  filters: TransactionListFilterState;
  resultCount: number | null;
  accounts: Account[];
  categories: Category[];
};

const FORMAT_OPTIONS: {
  format: ExportFormat;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    format: "csv",
    title: "CSV",
    description: "Liviano, compatible con Excel y Google Sheets",
    icon: "📄",
  },
  {
    format: "xlsx",
    title: "Excel",
    description: "Hoja con fechas y montos listos para analizar",
    icon: "📊",
  },
];

const GENERIC_ERROR = "No se pudo generar el archivo. Intenta de nuevo.";

function describeFilters(
  filters: TransactionListFilterState,
  accounts: Account[],
  categories: Category[],
): string[] {
  const parts = [
    getPeriodChipLabel(filters.period, {
      from: filters.from ?? "",
      to: filters.to ?? "",
    }),
  ];
  if (filters.type !== "all") {
    parts.push(filters.type === "INCOME" ? "Ingresos" : "Gastos");
  }
  if (filters.accounts.mode === "none") {
    parts.push("Sin cuenta");
  } else if (filters.accounts.mode === "ids") {
    const ids = filters.accounts.ids;
    parts.push(
      ids.length === 1
        ? (accounts.find((account) => account.id === ids[0])?.name ?? "1 cuenta")
        : `${ids.length} cuentas`,
    );
  }
  if (filters.categoryId) {
    const category = categories.find((item) => item.id === filters.categoryId);
    if (category) parts.push(category.name);
  }
  return parts;
}

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

export function ExportTransactionsButton({
  filters,
  resultCount,
  accounts,
  categories,
}: ExportTransactionsButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEmpty = resultCount === 0;
  const summary = describeFilters(filters, accounts, categories);

  function close() {
    if (pending) return;
    setOpen(false);
    setError(null);
  }

  async function handleExport(format: ExportFormat) {
    setPending(format);
    setError(null);

    const params = transactionFiltersToSearchParams(filters);
    params.set("format", format);

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
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        aria-label="Exportar transacciones"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-4 w-4"
        >
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
        <span aria-hidden className="hidden sm:inline">
          Exportar
        </span>
      </Button>

      <BottomSheet
        open={open}
        title="Exportar"
        description={`Se exportan los movimientos con los filtros actuales: ${summary.join(" · ")}`}
        onClose={close}
      >
        <div className="flex flex-col gap-3 pb-2">
          {isEmpty ? (
            <Alert tone="info">
              No hay resultados para exportar con estos filtros.
            </Alert>
          ) : null}
          {error ? <Alert>{error}</Alert> : null}

          <div className="flex flex-col gap-1">
            {FORMAT_OPTIONS.map((option) => {
              const isPending = pending === option.format;
              return (
                <button
                  key={option.format}
                  type="button"
                  disabled={isEmpty || pending !== null}
                  onClick={() => handleExport(option.format)}
                  aria-busy={isPending}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-surface-muted/70 disabled:pointer-events-none disabled:opacity-60"
                >
                  <span aria-hidden className="text-xl">
                    {option.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {isPending ? "Generando archivo…" : option.description}
                    </span>
                  </span>
                  {isPending ? (
                    <span
                      aria-hidden
                      className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-primary"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
