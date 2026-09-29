"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { accountIcon } from "@/features/accounts/components/accountIcon";
import { ACCOUNT_TYPE_LABELS } from "@/features/accounts/schemas/accountSchema";
import type { Account } from "@/features/transactions/types";
import type { TransactionListAccountsFilter } from "@/features/transactions/utils/listFilters";

type AccountsFilterSheetProps = {
  open: boolean;
  accounts: Account[];
  value: TransactionListAccountsFilter;
  onClose: () => void;
  onApply: (next: TransactionListAccountsFilter) => void;
};

type Draft =
  | { mode: "all" }
  | { mode: "none" }
  | { mode: "ids"; ids: Set<string> };

function toDraft(value: TransactionListAccountsFilter): Draft {
  if (value.mode === "all") return { mode: "all" };
  if (value.mode === "none") return { mode: "none" };
  return { mode: "ids", ids: new Set(value.ids) };
}

function fromDraft(draft: Draft): TransactionListAccountsFilter {
  if (draft.mode === "all") return { mode: "all" };
  if (draft.mode === "none") return { mode: "none" };
  const ids = Array.from(draft.ids);
  if (ids.length === 0) return { mode: "all" };
  return { mode: "ids", ids };
}

function selectedCount(draft: Draft): number {
  if (draft.mode === "all" || draft.mode === "none") return 0;
  return draft.ids.size;
}

function Check({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface"
      }`}
    >
      {checked ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="h-3 w-3"
        >
          <path d="M5 12l4 4L19 7" />
        </svg>
      ) : null}
    </span>
  );
}

export function AccountsFilterSheet({
  open,
  accounts,
  value,
  onClose,
  onApply,
}: AccountsFilterSheetProps) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(value));
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(toDraft(value));
  }

  const sorted = [...accounts].sort(
    (a, b) => Number(b.is_active) - Number(a.is_active),
  );
  const count = selectedCount(draft);

  function selectAll() {
    setDraft({ mode: "all" });
  }

  function selectNone() {
    setDraft({ mode: "none" });
  }

  function toggleAccount(id: string) {
    setDraft((prev) => {
      const nextIds =
        prev.mode === "ids" ? new Set(prev.ids) : new Set<string>();
      if (nextIds.has(id)) nextIds.delete(id);
      else nextIds.add(id);
      if (nextIds.size === 0) return { mode: "all" };
      return { mode: "ids", ids: nextIds };
    });
  }

  return (
    <BottomSheet
      open={open}
      title="Cuentas"
      description="Muestra solo los movimientos de estas cuentas"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => setDraft({ mode: "all" })}
          >
            Limpiar
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            onClick={() => {
              onApply(fromDraft(draft));
              onClose();
            }}
          >
            {count > 0 ? `Aplicar (${count})` : "Aplicar"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-1 pb-2">
        <button
          type="button"
          onClick={selectAll}
          aria-pressed={draft.mode === "all"}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
            draft.mode === "all" ? "bg-surface-muted" : "hover:bg-surface-muted/70"
          }`}
        >
          <span aria-hidden className="text-xl">
            💳
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Todas las cuentas
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {accounts.length} {accounts.length === 1 ? "cuenta" : "cuentas"}
            </span>
          </span>
          <Check checked={draft.mode === "all"} />
        </button>

        {sorted.map((account) => {
          const checked =
            draft.mode === "ids" && draft.ids.has(account.id);
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => toggleAccount(account.id)}
              aria-pressed={checked}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                checked ? "bg-surface-muted" : "hover:bg-surface-muted/70"
              } ${account.is_active ? "" : "opacity-70"}`}
            >
              <span aria-hidden className="text-xl">
                {accountIcon(account.type)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {account.name}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {ACCOUNT_TYPE_LABELS[account.type]} · {account.currency}
                </span>
              </span>
              <Check checked={checked} />
            </button>
          );
        })}

        <button
          type="button"
          onClick={selectNone}
          aria-pressed={draft.mode === "none"}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
            draft.mode === "none"
              ? "bg-surface-muted"
              : "hover:bg-surface-muted/70"
          }`}
        >
          <span aria-hidden className="text-xl">
            📭
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Sin cuenta
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Movimientos antiguos sin cuenta
            </span>
          </span>
          <Check checked={draft.mode === "none"} />
        </button>
      </div>
    </BottomSheet>
  );
}
