"use client";

import Link from "next/link";
import { type FormEvent } from "react";
import { usePaymentMethodForm } from "@/features/payment-methods/hooks/usePaymentMethodForm";
import type { PaymentMethod } from "@/features/transactions/types";

type PaymentMethodFormProps = {
  mode: "create" | "edit";
  paymentMethod?: PaymentMethod;
};

const inputClassName =
  "h-12 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-base text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60";

const labelClassName = "text-sm font-medium text-zinc-600 dark:text-zinc-300";

export function PaymentMethodForm({
  mode,
  paymentMethod,
}: PaymentMethodFormProps) {
  const { values, updateField, fieldErrors, formError, loading, submit } =
    usePaymentMethodForm({ mode, paymentMethod });

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
            ? "Crear método de pago"
            : "Guardar cambios"}
      </button>

      <Link
        href="/settings/payment-methods"
        className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 underline"
      >
        Cancelar
      </Link>
    </form>
  );
}
