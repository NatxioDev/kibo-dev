"use client";

import Link from "next/link";
import { type FormEvent } from "react";
import { useTransactionForm } from "@/features/transactions/hooks/useTransactionForm";
import type { Transaction } from "@/features/transactions/types";

type TransactionFormProps = {
  mode: "create" | "edit";
  transaction?: Transaction;
};

const inputClassName =
  "h-12 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-base text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60";

const labelClassName = "text-sm font-medium text-zinc-300";

export function TransactionForm({ mode, transaction }: TransactionFormProps) {
  const {
    values,
    updateField,
    fieldErrors,
    formError,
    categories,
    paymentMethods,
    loadingOptions,
    optionsError,
    loading,
    submit,
  } = useTransactionForm({ mode, transaction });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  const disabled = loading || loadingOptions;

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Tipo</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateField("type", "EXPENSE")}
            className={`h-12 rounded-lg border text-base font-medium ${
              values.type === "EXPENSE"
                ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                : "border-zinc-700 bg-zinc-900 text-zinc-100"
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateField("type", "INCOME")}
            className={`h-12 rounded-lg border text-base font-medium ${
              values.type === "INCOME"
                ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                : "border-zinc-700 bg-zinc-900 text-zinc-100"
            }`}
          >
            Ingreso
          </button>
        </div>
        {fieldErrors.type ? (
          <p className="text-sm text-red-400">{fieldErrors.type}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className={labelClassName}>
          Monto
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={values.amount}
          disabled={disabled}
          onChange={(event) => updateField("amount", event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.amount ? (
          <p className="text-sm text-red-400">{fieldErrors.amount}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="currency" className={labelClassName}>
          Moneda
        </label>
        <select
          id="currency"
          name="currency"
          value={values.currency}
          disabled={disabled}
          onChange={(event) =>
            updateField("currency", event.target.value as "BOB" | "USD")
          }
          className={inputClassName}
        >
          <option value="BOB">BOB</option>
          <option value="USD">USD</option>
        </select>
        {fieldErrors.currency ? (
          <p className="text-sm text-red-400">{fieldErrors.currency}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className={labelClassName}>
          Fecha
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={values.date}
          disabled={disabled}
          onChange={(event) => updateField("date", event.target.value)}
          className={inputClassName}
        />
        {fieldErrors.date ? (
          <p className="text-sm text-red-400">{fieldErrors.date}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category_id" className={labelClassName}>
          Categoría
        </label>
        <select
          id="category_id"
          name="category_id"
          value={values.category_id}
          disabled={disabled}
          onChange={(event) => updateField("category_id", event.target.value)}
          className={inputClassName}
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {fieldErrors.category_id ? (
          <p className="text-sm text-red-400">{fieldErrors.category_id}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="payment_method_id" className={labelClassName}>
          Método de pago
        </label>
        <select
          id="payment_method_id"
          name="payment_method_id"
          value={values.payment_method_id}
          disabled={disabled}
          onChange={(event) =>
            updateField("payment_method_id", event.target.value)
          }
          className={inputClassName}
        >
          <option value="">Sin método</option>
          {paymentMethods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.name}
            </option>
          ))}
        </select>
        {fieldErrors.payment_method_id ? (
          <p className="text-sm text-red-400">{fieldErrors.payment_method_id}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="merchant" className={labelClassName}>
          Comercio
        </label>
        <input
          id="merchant"
          name="merchant"
          type="text"
          value={values.merchant}
          disabled={disabled}
          onChange={(event) => updateField("merchant", event.target.value)}
          className={inputClassName}
          placeholder="Opcional"
        />
        {fieldErrors.merchant ? (
          <p className="text-sm text-red-400">{fieldErrors.merchant}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className={labelClassName}>
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={values.description}
          disabled={disabled}
          onChange={(event) => updateField("description", event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-base text-zinc-50 outline-none placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60"
          placeholder="Opcional"
        />
        {fieldErrors.description ? (
          <p className="text-sm text-red-400">{fieldErrors.description}</p>
        ) : null}
      </div>

      {optionsError ? (
        <p className="text-sm text-red-400" role="alert">
          {optionsError}
        </p>
      ) : null}

      {formError ? (
        <p className="text-sm text-red-400" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="h-12 w-full rounded-lg bg-zinc-100 text-base font-medium text-zinc-900 disabled:opacity-60"
      >
        {loading
          ? mode === "create"
            ? "Guardando…"
            : "Actualizando…"
          : mode === "create"
            ? "Crear transacción"
            : "Guardar cambios"}
      </button>

      <Link
        href="/"
        className="text-center text-sm font-medium text-zinc-400 underline"
      >
        Cancelar
      </Link>
    </form>
  );
}
