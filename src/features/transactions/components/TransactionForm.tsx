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
  "h-12 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 text-base text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60";

const labelClassName = "text-sm font-medium text-zinc-600 dark:text-zinc-300";

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
            className={`h-12 rounded-lg border text-base font-medium ${values.type === "EXPENSE"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
              }`}
          >
            Gasto
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateField("type", "INCOME")}
            className={`h-12 rounded-lg border text-base font-medium ${values.type === "INCOME"
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

      <div className="flex flex-row gap-2">

        <div className="flex flex-col w-full gap-1.5">
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
            <p className="text-sm text-expense">{fieldErrors.amount}</p>
          ) : null}
        </div>

        <div className="flex flex-col w-[40%] gap-1.5">
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
            <p className="text-sm text-expense">{fieldErrors.currency}</p>
          ) : null}
        </div>

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
          <p className="text-sm text-expense">{fieldErrors.date}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Categoría</span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateField("category_id", "")}
            className={`flex h-20 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border px-2 text-center text-xs font-medium ${
              values.category_id === ""
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
            }`}
          >
            <span className="text-xl" aria-hidden>
              📦
            </span>
            <span className="line-clamp-2 leading-tight">Sin categoría</span>
          </button>
          {categories.map((category) => {
            const selected = values.category_id === category.id;
            const icon = category.icon?.trim() || "📦";

            return (
              <button
                key={category.id}
                type="button"
                disabled={disabled}
                onClick={() => updateField("category_id", category.id)}
                className={`flex h-20 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border px-2 text-center text-xs font-medium ${
                  selected
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900"
                    : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                }`}
              >
                <span className="text-xl" aria-hidden>
                  {icon}
                </span>
                <span className="line-clamp-2 leading-tight">{category.name}</span>
              </button>
            );
          })}
        </div>
        {fieldErrors.category_id ? (
          <p className="text-sm text-expense">{fieldErrors.category_id}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Método de pago</span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateField("payment_method_id", "")}
            className={`flex h-14 w-32 shrink-0 items-center justify-center rounded-lg border px-3 text-center text-sm font-medium ${
              values.payment_method_id === ""
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
            }`}
          >
            Sin método
          </button>
          {paymentMethods.map((method) => {
            const selected = values.payment_method_id === method.id;

            return (
              <button
                key={method.id}
                type="button"
                disabled={disabled}
                onClick={() => updateField("payment_method_id", method.id)}
                className={`flex h-14 w-32 shrink-0 items-center justify-center rounded-lg border px-3 text-center text-sm font-medium ${
                  selected
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900"
                    : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                }`}
              >
                <span className="line-clamp-2 leading-tight">{method.name}</span>
              </button>
            );
          })}
        </div>
        {fieldErrors.payment_method_id ? (
          <p className="text-sm text-expense">{fieldErrors.payment_method_id}</p>
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
          <p className="text-sm text-expense">{fieldErrors.merchant}</p>
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
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-base text-zinc-900 dark:text-zinc-50 outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-500 disabled:opacity-60"
          placeholder="Opcional"
        />
        {fieldErrors.description ? (
          <p className="text-sm text-expense">{fieldErrors.description}</p>
        ) : null}
      </div>

      {optionsError ? (
        <p className="text-sm text-expense" role="alert">
          {optionsError}
        </p>
      ) : null}

      {formError ? (
        <p className="text-sm text-expense" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="h-12 w-full rounded-lg bg-zinc-900 dark:bg-zinc-100 text-base font-medium text-zinc-50 dark:text-zinc-900 disabled:opacity-60"
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
        className="text-center text-sm font-medium text-zinc-500 dark:text-zinc-400 underline"
      >
        Cancelar
      </Link>
    </form>
  );
}
