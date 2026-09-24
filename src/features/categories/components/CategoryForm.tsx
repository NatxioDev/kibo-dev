"use client";

import Link from "next/link";
import { type FormEvent } from "react";
import { useCategoryForm } from "@/features/categories/hooks/useCategoryForm";
import type { Category } from "@/features/transactions/types";

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: Category;
};

const inputClassName =
  "h-12 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-base text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60";

const labelClassName = "text-sm font-medium text-zinc-600 dark:text-zinc-300";

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const { values, updateField, fieldErrors, formError, loading, submit } =
    useCategoryForm({ mode, category });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClassName}>
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          disabled={loading}
          onChange={(event) => updateField("name", event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.name ? (
          <p className="text-sm text-expense">{fieldErrors.name}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="icon" className={labelClassName}>
          Emoji
        </label>
        <input
          id="icon"
          name="icon"
          type="text"
          value={values.icon}
          disabled={loading}
          onChange={(event) => updateField("icon", event.target.value)}
          className={inputClassName}
          placeholder="Opcional, ej. 🍔"
        />
        {fieldErrors.icon ? (
          <p className="text-sm text-expense">{fieldErrors.icon}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Tipo</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => updateField("type", "EXPENSE")}
            className={`h-12 rounded-lg border text-base font-medium ${
              values.type === "EXPENSE"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => updateField("type", "INCOME")}
            className={`h-12 rounded-lg border text-base font-medium ${
              values.type === "INCOME"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
            }`}
          >
            Ingreso
          </button>
        </div>
        {fieldErrors.type ? (
          <p className="text-sm text-expense">{fieldErrors.type}</p>
        ) : null}
      </div>

      {formError ? (
        <p className="text-sm text-expense" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 text-base font-medium text-zinc-50 dark:text-zinc-900 disabled:opacity-60"
      >
        {loading
          ? mode === "create"
            ? "Guardando…"
            : "Actualizando…"
          : mode === "create"
            ? "Crear categoría"
            : "Guardar cambios"}
      </button>

      <Link
        href="/settings/categories"
        className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 underline"
      >
        Cancelar
      </Link>
    </form>
  );
}
