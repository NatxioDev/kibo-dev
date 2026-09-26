"use client";

import { type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { labelClassName } from "@/components/ui/Field";
import {
  useUsernameForm,
  type UseUsernameFormOptions,
  type UsernameStatus,
} from "@/features/profile/hooks/useUsernameForm";

const STATUS_MESSAGES: Partial<Record<UsernameStatus, string>> = {
  unchanged: "Es tu nombre de usuario actual.",
  checking: "Comprobando disponibilidad…",
  available: "✓ Disponible",
  taken: "Ese nombre de usuario ya existe.",
};

type UsernameFormProps = UseUsernameFormOptions & {
  submitLabel: string;
  onCancel?: () => void;
};

export function UsernameForm({
  submitLabel,
  onCancel,
  ...options
}: UsernameFormProps) {
  const { value, updateValue, status, validationError, formError, loading, submit } =
    useUsernameForm(options);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  const hint = validationError ?? STATUS_MESSAGES[status] ?? null;
  const invalid = status === "invalid" || status === "taken";
  const hintClassName =
    status === "available"
      ? "text-income"
      : invalid
        ? "text-expense"
        : "text-muted-foreground";

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className={`px-1 ${labelClassName}`}>
          Nombre de usuario
        </label>
        <div
          className={`glass flex h-12 w-full items-center rounded-2xl border bg-surface px-4 shadow-card transition-colors focus-within:ring-2 focus-within:ring-primary/50 ${
            invalid ? "border-expense/60" : "border-border"
          }`}
        >
          <span aria-hidden className="text-base font-semibold text-muted-foreground">
            @
          </span>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(event) => updateValue(event.target.value)}
            disabled={loading}
            placeholder="tu_usuario…"
            aria-invalid={invalid || undefined}
            aria-describedby="username-hint"
            className="h-full w-full bg-transparent pl-0.5 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
          />
        </div>
        <p
          id="username-hint"
          aria-live="polite"
          className={`min-h-5 px-1 text-sm ${hint ? hintClassName : "text-muted-foreground"}`}
        >
          {hint ?? "De 3 a 20 caracteres: letras, números o guion bajo."}
        </p>
      </div>

      {formError ? <Alert>{formError}</Alert> : null}

      <div className="flex gap-2">
        {onCancel ? (
          <Button
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
        ) : null}
        <Button
          type="submit"
          size="lg"
          disabled={loading || status !== "available"}
          className="flex-1"
        >
          {loading ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
