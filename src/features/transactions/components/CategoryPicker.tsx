"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ChoiceChip } from "@/components/ui/ChoiceChip";
import { inputClassName } from "@/components/ui/Field";
import {
  filterCategories,
  gridCategories,
} from "@/features/transactions/domain/categoryPicker";
import type { Category } from "@/features/transactions/domain/models";

type CategoryPickerProps = {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
};

export function CategoryPicker({
  categories,
  value,
  onChange,
  disabled = false,
}: CategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const grid = gridCategories(categories, value);
  const matches = filterCategories(categories, query);

  function select(categoryId: string) {
    onChange(categoryId);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <div
        id="category_id"
        tabIndex={-1}
        role="group"
        aria-label="Categoría"
        className="grid grid-cols-4 gap-2"
      >
        {grid.map((category) => (
          <ChoiceChip
            key={category.id}
            icon={category.icon?.trim() || "📦"}
            selected={value === category.id}
            disabled={disabled}
            onSelect={() => onChange(category.id)}
            className="h-20 w-full"
          >
            {category.name}
          </ChoiceChip>
        ))}
        <ChoiceChip
          icon="🔎"
          selected={false}
          disabled={disabled}
          onSelect={() => setOpen(true)}
          className="h-20 w-full"
        >
          Ver todas
        </ChoiceChip>
      </div>

      <BottomSheet open={open} title="Categorías" onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-3 pb-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar categoría…"
            aria-label="Buscar categoría"
            className={inputClassName}
          />
          <div className="flex flex-col gap-1">
            <SheetOption
              icon="📦"
              label="Sin categoría"
              selected={value === ""}
              onClick={() => select("")}
            />
            {matches.map((category) => (
              <SheetOption
                key={category.id}
                icon={category.icon?.trim() || "📦"}
                label={category.name}
                selected={value === category.id}
                onClick={() => select(category.id)}
              />
            ))}
            {matches.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                No tienes una categoría con ese nombre.
              </p>
            ) : null}
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

function SheetOption({
  icon,
  label,
  selected = false,
  onClick,
}: {
  icon: string;
  label: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition ${
        selected ? "bg-surface-muted" : "hover:bg-surface-muted/70"
      }`}
    >
      <span aria-hidden className="text-xl">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {label}
      </span>
    </button>
  );
}
