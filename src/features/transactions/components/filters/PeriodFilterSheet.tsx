"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Field, inputClassName } from "@/components/ui/Field";
import { todayDateInputValue } from "@/features/transactions/components/formatters";
import {
  formatSpanishDateRange,
  getPeriodOptionLabel,
  getTransactionPeriodRange,
  type TransactionListPeriod,
} from "@/features/transactions/utils/period";

type PeriodDraft = {
  period: TransactionListPeriod;
  from?: string;
  to?: string;
};

type PeriodFilterSheetProps = {
  open: boolean;
  period: TransactionListPeriod;
  from?: string;
  to?: string;
  onClose: () => void;
  onApply: (next: PeriodDraft) => void;
};

const PRESET_PERIODS: Exclude<TransactionListPeriod, "custom">[] = [
  "this_month",
  "last_month",
  "last_7",
  "last_30",
];

function RadioRow({
  selected,
  title,
  subtitle,
  onSelect,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
        selected
          ? "bg-surface-muted"
          : "hover:bg-surface-muted/70"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {subtitle}
        </span>
      </span>
      <span
        aria-hidden
        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-surface"
        }`}
      >
        {selected ? (
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
    </button>
  );
}

export function PeriodFilterSheet({
  open,
  period,
  from,
  to,
  onClose,
  onApply,
}: PeriodFilterSheetProps) {
  const [draft, setDraft] = useState<PeriodDraft>({ period, from, to });
  const [wasOpen, setWasOpen] = useState(open);
  const today = todayDateInputValue();

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft({ period, from, to });
  }

  function selectPreset(next: Exclude<TransactionListPeriod, "custom">) {
    const range = getTransactionPeriodRange(next);
    setDraft({ period: next, from: range.from, to: range.to });
  }

  function selectCustom() {
    setDraft((prev) => ({
      period: "custom",
      from: prev.from,
      to: prev.to ?? today,
    }));
  }

  function apply() {
    if (draft.period === "custom") {
      let customFrom = draft.from;
      let customTo = draft.to;
      if (customFrom && customTo && customFrom > customTo) {
        [customFrom, customTo] = [customTo, customFrom];
      }
      onApply({ period: "custom", from: customFrom, to: customTo });
      return;
    }
    const range = getTransactionPeriodRange(draft.period);
    onApply({ period: draft.period, from: range.from, to: range.to });
  }

  return (
    <BottomSheet
      open={open}
      title="Período"
      description="Elige el rango de fechas de tus movimientos"
      onClose={onClose}
      footer={
        <Button type="button" size="lg" className="w-full" onClick={apply}>
          Aplicar
        </Button>
      }
    >
      <div className="flex flex-col gap-1 pb-2">
        {PRESET_PERIODS.map((preset) => {
          const range = getTransactionPeriodRange(preset);
          return (
            <RadioRow
              key={preset}
              selected={draft.period === preset}
              title={getPeriodOptionLabel(preset)}
              subtitle={formatSpanishDateRange(range.from, range.to)}
              onSelect={() => selectPreset(preset)}
            />
          );
        })}

        <button
          type="button"
          onClick={selectCustom}
          aria-pressed={draft.period === "custom"}
          className={`mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
            draft.period === "custom"
              ? "bg-surface-muted"
              : "hover:bg-surface-muted/70"
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Personalizado
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Elige fecha de inicio y fin
            </span>
          </span>
          <span aria-hidden className="text-muted-foreground">
            ›
          </span>
        </button>

        {draft.period === "custom" ? (
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field label="Desde" htmlFor="period-from">
              <input
                id="period-from"
                type="date"
                value={draft.from ?? ""}
                max={draft.to && draft.to < today ? draft.to : today}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    from: event.target.value || undefined,
                  }))
                }
                className={inputClassName}
              />
            </Field>
            <Field label="Hasta" htmlFor="period-to">
              <input
                id="period-to"
                type="date"
                value={draft.to ?? ""}
                min={draft.from}
                max={today}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    to: event.target.value || undefined,
                  }))
                }
                className={inputClassName}
              />
            </Field>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  );
}
