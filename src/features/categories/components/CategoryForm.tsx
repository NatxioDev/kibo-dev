"use client";

import { type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  errorProps,
  Field,
  focusFirstError,
  inputClassName,
} from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { useCategoryForm } from "@/features/categories/hooks/useCategoryForm";
import type { Category } from "@/features/transactions/types";

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: Category;
};

const EMOJI_SUGGESTIONS = {
  EXPENSE: ["🍔", "🛒", "🚗", "🏠", "💡", "🎬", "👕", "💊", "✈️", "🎁", "📚", "☕"],
  INCOME: ["💰", "💼", "📈", "🏦", "🎁", "🪙", "💵", "🧾"],
} as const;

export function CategoryForm({ mode, category }: CategoryFormProps) {
  const { values, updateField, fieldErrors, formError, loading, submit } =
    useCategoryForm({ mode, category });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstError(submit(), ["type", "name", "icon"]);
  }

  const previewIcon = values.icon.trim() || "📦";
  const previewName = values.name.trim() || "Nueva categoría";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-6">
      <Card className="flex items-center gap-4 px-5 py-4" aria-hidden>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-surface-muted text-3xl">
          {previewIcon}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-display text-xl font-extrabold tracking-[-0.03em] text-foreground">
            {previewName}
          </span>
          <span className="text-sm text-muted-foreground">
            {values.type === "INCOME" ? "Ingreso" : "Gasto"}
          </span>
        </span>
      </Card>

      <div id="type" tabIndex={-1} className="rounded-control">
        <Segmented
          label="Tipo de categoría"
          size="lg"
          value={values.type}
          disabled={loading}
          onChange={(value) => updateField("type", value)}
          options={[
            { value: "EXPENSE", label: "Gasto" },
            { value: "INCOME", label: "Ingreso" },
          ]}
        />
      </div>

      <Field label="Nombre" htmlFor="name" error={fieldErrors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          value={values.name}
          disabled={loading}
          onChange={(event) => updateField("name", event.target.value)}
          {...errorProps("name", fieldErrors.name)}
          className={inputClassName}
          placeholder={values.type === "INCOME" ? "Ej. Sueldo…" : "Ej. Comida…"}
        />
      </Field>

      <Field
        label="Emoji"
        htmlFor="icon"
        error={fieldErrors.icon}
        hint="Elige uno o escribe el tuyo."
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sugerencias de emoji">
          {EMOJI_SUGGESTIONS[values.type].map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-pressed={values.icon === emoji}
              aria-label={`Usar ${emoji}`}
              disabled={loading}
              onClick={() => updateField("icon", emoji)}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xl transition-[transform,background-color,border-color] active:scale-90 ${
                values.icon === emoji
                  ? "border-primary bg-primary/15"
                  : "glass border-border bg-surface hover:bg-surface-muted"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <input
          id="icon"
          name="icon"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={values.icon}
          disabled={loading}
          onChange={(event) => updateField("icon", event.target.value)}
          {...errorProps("icon", fieldErrors.icon)}
          className={`${inputClassName} w-24 text-center text-xl`}
          placeholder="🙂"
        />
      </Field>

      {formError ? <Alert>{formError}</Alert> : null}

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading
            ? mode === "create"
              ? "Guardando…"
              : "Actualizando…"
            : mode === "create"
              ? "Crear categoría"
              : "Guardar cambios"}
        </Button>
        <Button href="/settings/categories" variant="ghost">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
