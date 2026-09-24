"use client";

import Link from "next/link";
import { useState } from "react";
import { DeactivateCategoryDialog } from "@/features/categories/components/DeactivateCategoryDialog";
import { formatCategoryLabel } from "@/features/categories/components/formatCategoryLabel";
import { useToggleCategoryActive } from "@/features/categories/hooks/useToggleCategoryActive";
import type { Category } from "@/features/transactions/types";

type CategoryListItemProps = {
  category: Category;
};

export function CategoryListItem({ category }: CategoryListItemProps) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const { toggle, error, loading } = useToggleCategoryActive();

  const label = formatCategoryLabel(category);
  const inactiveClass = category.is_active ? "" : "opacity-50";

  return (
    <>
      <article
        className={`flex flex-col gap-3 border-b border-zinc-200 dark:border-zinc-800 py-4 last:border-b-0 ${inactiveClass}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-zinc-900 dark:text-zinc-50">
              {label}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {category.is_active ? "Activa" : "Inactiva"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/settings/categories/${category.id}/edit`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-800 dark:text-zinc-100"
          >
            Editar
          </Link>
          {category.is_active ? (
            <button
              type="button"
              onClick={() => setDeactivateOpen(true)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-expense"
            >
              Desactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggle(category.id, true)}
              disabled={loading}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium text-zinc-800 dark:text-zinc-100 disabled:opacity-60"
            >
              {loading ? "Activando…" : "Activar"}
            </button>
          )}
        </div>

        {error && !deactivateOpen ? (
          <p className="text-sm text-expense" role="alert">
            {error}
          </p>
        ) : null}
      </article>

      <DeactivateCategoryDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        categoryId={category.id}
        categoryName={category.name}
      />
    </>
  );
}
