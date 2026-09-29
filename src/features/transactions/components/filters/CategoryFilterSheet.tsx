"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/features/transactions/types";

type CategoryFilterSheetProps = {
  open: boolean;
  categories: Category[];
  value?: string;
  onClose: () => void;
  onApply: (categoryId: string | undefined) => void;
};

function Radio({ selected }: { selected: boolean }) {
  return (
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
  );
}

export function CategoryFilterSheet({
  open,
  categories,
  value,
  onClose,
  onApply,
}: CategoryFilterSheetProps) {
  const [draft, setDraft] = useState<string | undefined>(value);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }

  const sorted = useMemo(
    () =>
      [...categories].sort((a, b) => {
        const active = Number(b.is_active) - Number(a.is_active);
        if (active !== 0) return active;
        return a.name.localeCompare(b.name, "es");
      }),
    [categories],
  );

  return (
    <BottomSheet
      open={open}
      title="Categoría"
      description="Muestra solo los movimientos de esta categoría"
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => setDraft(undefined)}
          >
            Limpiar
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Aplicar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-1 pb-2">
        <button
          type="button"
          onClick={() => setDraft(undefined)}
          aria-pressed={!draft}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
            !draft ? "bg-surface-muted" : "hover:bg-surface-muted/70"
          }`}
        >
          <span aria-hidden className="text-xl">
            🏷️
          </span>
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            Todas las categorías
          </span>
          <Radio selected={!draft} />
        </button>

        {sorted.map((category) => {
          const selected = draft === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setDraft(category.id)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                selected ? "bg-surface-muted" : "hover:bg-surface-muted/70"
              } ${category.is_active ? "" : "opacity-70"}`}
            >
              <span aria-hidden className="text-xl">
                {category.icon || "📁"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">
                  {category.name}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {category.type === "EXPENSE" ? "Gasto" : "Ingreso"}
                  {!category.is_active ? " · Inactiva" : ""}
                </span>
              </span>
              <Radio selected={selected} />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
