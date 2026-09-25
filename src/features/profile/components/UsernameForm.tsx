"use client";

import { type FormEvent } from "react";
import {
  useUsernameForm,
  type UseUsernameFormOptions,
  type UsernameStatus,
} from "@/features/profile/hooks/useUsernameForm";

const STATUS_MESSAGES: Partial<Record<UsernameStatus, string>> = {
  unchanged: "Es tu nombre de usuario actual.",
  checking: "Comprobando disponibilidad…",
  available: "Disponible",
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
  const {
    value,
    updateValue,
    status,
    validationError,
    formError,
    loading,
    submit,
  } = useUsernameForm(options);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  const hint = validationError ?? STATUS_MESSAGES[status] ?? null;
  const hintClassName =
    status === "available"
      ? "text-income"
      : status === "checking" || status === "unchanged"
        ? "text-zinc-500 dark:text-zinc-400"
        : "text-expense";

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="text-sm font-medium text-zinc-600 dark:text-zinc-300"
        >
          Nombre de usuario
        </label>
        <div className="flex h-12 w-full items-center rounded-lg border border-zinc-300 bg-white px-3 focus-within:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-base text-zinc-400 dark:text-zinc-500">@</span>
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
            placeholder="tu_usuario"
            className="h-full w-full bg-transparent pl-0.5 text-base text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          />
        </div>
        <p className={`min-h-5 text-sm ${hint ? hintClassName : ""}`}>
          {hint ?? (
            <span className="text-zinc-500 dark:text-zinc-400">
              De 3 a 20 caracteres: letras, números o guion bajo.
            </span>
          )}
        </p>
      </div>

      {formError ? (
        <p className="text-sm text-expense" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="h-12 flex-1 rounded-lg border border-zinc-300 bg-white text-base font-medium text-zinc-800 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={loading || status !== "available"}
          className="h-12 flex-1 rounded-lg bg-zinc-900 text-base font-medium text-zinc-50 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
