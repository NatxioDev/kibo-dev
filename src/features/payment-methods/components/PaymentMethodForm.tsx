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
import { usePaymentMethodForm } from "@/features/payment-methods/hooks/usePaymentMethodForm";
import type { PaymentMethod } from "@/features/transactions/types";

type PaymentMethodFormProps = {
  mode: "create" | "edit";
  paymentMethod?: PaymentMethod;
};

const NAME_SUGGESTIONS = ["Efectivo", "Tarjeta de débito", "Tarjeta de crédito", "QR", "Transferencia"];

export function PaymentMethodForm({
  mode,
  paymentMethod,
}: PaymentMethodFormProps) {
  const { values, updateField, fieldErrors, formError, loading, submit } =
    usePaymentMethodForm({ mode, paymentMethod });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstError(submit(), ["name"]);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-6">
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
          placeholder="Ej. Tarjeta BancoSol…"
        />
      </Field>

      {mode === "create" ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sugerencias">
          {NAME_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={loading}
              onClick={() => updateField("name", suggestion)}
              className="glass h-9 rounded-control border border-border bg-surface px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}

      {formError ? <Alert>{formError}</Alert> : null}

      <div className="flex flex-col gap-2">
        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading
            ? mode === "create"
              ? "Guardando…"
              : "Actualizando…"
            : mode === "create"
              ? "Crear método de pago"
              : "Guardar cambios"}
        </Button>
        <Button href="/settings/payment-methods" variant="ghost">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
