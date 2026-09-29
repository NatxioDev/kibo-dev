"use client";

import { type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  errorProps,
  Field,
  focusFirstError,
  inputClassName,
} from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { accountIcon } from "@/features/accounts/components/accountIcon";
import { useAccountFormWithActions } from "@/features/accounts/hooks/useAccountFormWithActions";
import {
  ACCOUNT_NAME_MAX_LENGTH,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPES,
  type AccountFormValues,
} from "@/features/accounts/schemas/accountSchema";
import type { Account } from "@/features/transactions/types";

type AccountFormProps = {
  mode: "create" | "edit";
  account?: Account;
};

const SUGGESTIONS: {
  name: string;
  type: AccountFormValues["type"];
  currency: AccountFormValues["currency"];
}[] = [
  { name: "BancoSol", type: "SAVINGS", currency: "BOB" },
  { name: "Efectivo", type: "CASH", currency: "BOB" },
  { name: "Banco USD", type: "SAVINGS", currency: "USD" },
  { name: "Gastos diarios", type: "EXPENSES", currency: "BOB" },
];

export function AccountForm({ mode, account }: AccountFormProps) {
  const { values, updateField, fieldErrors, formError, loading, submit } =
    useAccountFormWithActions({ mode, account });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstError(submit(), ["name", "type", "currency"]);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-6">
      <Field label="Nombre" htmlFor="name" error={fieldErrors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="off"
          maxLength={ACCOUNT_NAME_MAX_LENGTH}
          value={values.name}
          disabled={loading}
          onChange={(event) => updateField("name", event.target.value)}
          {...errorProps("name", fieldErrors.name)}
          className={inputClassName}
          placeholder="Ej. Banco Sol Ahorros BOB…"
        />
      </Field>

      {mode === "create" ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sugerencias">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.name}
              type="button"
              disabled={loading}
              onClick={() => {
                updateField("name", suggestion.name);
                updateField("type", suggestion.type);
                updateField("currency", suggestion.currency);
              }}
              className="glass flex h-9 items-center gap-1.5 rounded-control border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
            >
              <span aria-hidden>{accountIcon(suggestion.type)}</span>
              {suggestion.name}
            </button>
          ))}
        </div>
      ) : null}

      <Field label="Tipo" errorFor="type" error={fieldErrors.type}>
        <div
          id="type"
          tabIndex={-1}
          role="group"
          aria-label="Tipo de cuenta"
          className="flex flex-wrap gap-2"
        >
          {ACCOUNT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={values.type === type}
              disabled={loading}
              onClick={() => updateField("type", type)}
              className={`flex h-11 items-center gap-2 rounded-2xl border px-3.5 text-sm font-semibold transition-colors ${
                values.type === type
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "glass border-border bg-surface text-foreground hover:bg-surface-muted"
              }`}
            >
              <span aria-hidden>{accountIcon(type)}</span>
              {ACCOUNT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </Field>

      <div id="currency" tabIndex={-1} className="rounded-control">
        <Segmented
          label="Moneda"
          size="lg"
          value={values.currency}
          disabled={loading}
          onChange={(value) => updateField("currency", value)}
          options={[
            { value: "BOB", label: "BOB" },
            { value: "USD", label: "USD" },
          ]}
        />
        {fieldErrors.currency ? (
          <p className="mt-2 text-sm text-expense" aria-live="polite">
            {fieldErrors.currency}
          </p>
        ) : null}
      </div>

      {formError ? <Alert>{formError}</Alert> : null}

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading
            ? mode === "create"
              ? "Guardando…"
              : "Actualizando…"
            : mode === "create"
              ? "Crear cuenta"
              : "Guardar cambios"}
        </Button>
        <Button href="/settings/accounts" variant="ghost">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
