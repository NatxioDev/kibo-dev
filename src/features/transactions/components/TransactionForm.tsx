"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipScroller, ChoiceChip } from "@/components/ui/ChoiceChip";
import {
  errorProps,
  Field,
  focusFirstError,
  inputClassName,
  labelClassName,
  textareaClassName,
} from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { Currency } from "@/core/domain/value-objects";
import { accountIcon } from "@/features/accounts/components/accountIcon";
import { AmountInput } from "@/features/transactions/components/AmountInput";
import { todayDateInputValue } from "@/features/transactions/components/formatters";
import { useTransactionFormWithActions } from "@/features/transactions/hooks/useTransactionFormWithActions";
import {
  DESCRIPTION_MAX_LENGTH,
  MERCHANT_MAX_LENGTH,
} from "@/features/transactions/schemas/transactionSchema";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import { SplitWithFriends } from "@/features/splits/components/SplitWithFriends";
import type { ExpenseEditContext } from "@/features/splits/domain/models";
import type { Transaction } from "@/features/transactions/types";

type TransactionFormProps = {
  mode: "create" | "edit" | "edit-bill";
  transaction?: Transaction;
  friends?: FriendProfile[];
  bill?: ExpenseEditContext | null;
  shareLock?: { payerName: string } | null;
  preset?: "debt";
};

const FIELD_ORDER = [
  "type",
  "amount",
  "currency",
  "date",
  "account_id",
  "category_id",
  "payment_method_id",
  "merchant",
  "description",
  "split",
] as const;

function yesterdayDateInputValue(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ChipSkeleton({ className }: { className: string }) {
  return (
    <ChipScroller>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          aria-hidden
          className={`shrink-0 animate-pulse rounded-2xl bg-surface-muted ${className}`}
        />
      ))}
    </ChipScroller>
  );
}

export function TransactionForm({
  mode,
  transaction,
  friends = [],
  bill = null,
  shareLock = null,
  preset,
}: TransactionFormProps) {
  const router = useRouter();
  const {
    values,
    updateField,
    selectAccount,
    split,
    updateSplit,
    toggleFriend,
    setFriendAmount,
    fieldErrors,
    formError,
    accounts,
    categories,
    paymentMethods,
    loadingOptions,
    optionsError,
    loading,
    submit,
    requiresAccount,
    amountLocked,
    typeLocked,
    showSplit,
    splitRequired,
    isDebt,
  } = useTransactionFormWithActions({ mode, transaction, friends, bill, shareLock, preset });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstError(submit(), FIELD_ORDER);
  }

  function handleCancel() {
    const fallback =
      mode === "edit" && transaction
        ? `/transactions/${transaction.id}`
        : mode === "edit-bill" || isDebt
          ? "/friends"
          : "/transactions";
    if (window.history.length > 1) router.back();
    else router.push(fallback);
  }

  const today = todayDateInputValue();
  const yesterday = yesterdayDateInputValue();
  const currency = Currency.from(values.currency);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-6">
      <div id="type" tabIndex={-1} className="rounded-control">
        <Segmented
          label="Tipo de transacción"
          size="lg"
          value={values.type}
          disabled={loading || typeLocked}
          onChange={(value) => updateField("type", value)}
          options={[
            { value: "EXPENSE", label: "Gasto" },
            { value: "INCOME", label: "Ingreso" },
          ]}
        />
      </div>

      <Card className="flex flex-col gap-3 px-5 pt-4 pb-5 focus-within:ring-2 focus-within:ring-primary/50">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="amount" className={labelClassName}>
            {showSplit && split.enabled ? "Total de la cuenta" : "Monto"}
          </label>
          <Segmented
            label="Moneda"
            value={values.currency}
            disabled={loading || amountLocked}
            onChange={(value) => updateField("currency", value)}
            options={[
              { value: "BOB", label: "BOB" },
              { value: "USD", label: "USD" },
            ]}
            className="w-32 shadow-none"
          />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            aria-hidden
            className="font-display text-3xl font-bold tracking-tight text-muted-foreground"
          >
            {currency.symbol}
          </span>
          <AmountInput
            id="amount"
            name="amount"
            autoComplete="off"
            currency={currency}
            value={values.amount}
            disabled={loading || amountLocked}
            onValueChange={(amount) => updateField("amount", amount)}
            {...errorProps("amount", fieldErrors.amount)}
            className={`w-full min-w-0 bg-transparent font-display text-5xl font-extrabold tracking-[-0.045em] tabular-nums placeholder:text-muted-foreground/40 focus-visible:outline-none ${
              values.type === "INCOME" ? "text-income" : "text-foreground"
            }`}
          />
        </div>
        {fieldErrors.amount || fieldErrors.currency ? (
          <p id="amount-error" className="text-sm text-expense" aria-live="polite">
            {fieldErrors.amount ?? fieldErrors.currency}
          </p>
        ) : null}
      </Card>

      <Field label="Fecha" htmlFor="date" error={fieldErrors.date}>
        <div className="flex gap-2">
          <input
            id="date"
            name="date"
            type="date"
            value={values.date}
            disabled={loading}
            onChange={(event) => updateField("date", event.target.value)}
            {...errorProps("date", fieldErrors.date)}
            className={`${inputClassName} min-w-0 flex-1`}
          />
          {[
            { value: today, label: "Hoy" },
            { value: yesterday, label: "Ayer" },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={values.date === option.value}
              disabled={loading}
              onClick={() => updateField("date", option.value)}
              className={`h-12 shrink-0 rounded-2xl border px-3.5 text-sm font-semibold shadow-card transition-colors ${
                values.date === option.value
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "glass border-border bg-surface text-foreground hover:bg-surface-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Cuenta" errorFor="account_id" error={fieldErrors.account_id}>
        {loadingOptions ? (
          <ChipSkeleton className="h-12 w-28" />
        ) : accounts.length === 0 ? (
          <p
            id="account_id"
            tabIndex={-1}
            className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
          >
            Aún no tienes cuentas; este movimiento se guardará sin cuenta.{" "}
            <Link
              href="/settings/accounts/new"
              className="font-semibold text-primary hover:opacity-80"
            >
              Crear una cuenta
            </Link>
          </p>
        ) : (
          <ChipScroller>
            <div
              id="account_id"
              tabIndex={-1}
              role="group"
              aria-label="Cuenta"
              className="flex gap-2"
            >
              {!requiresAccount ? (
                <ChoiceChip
                  selected={values.account_id === ""}
                  disabled={loading}
                  onSelect={() => updateField("account_id", "")}
                  className="h-12 min-w-28 text-sm"
                >
                  Sin cuenta
                </ChoiceChip>
              ) : null}
              {accounts.map((account) => (
                <ChoiceChip
                  key={account.id}
                  icon={accountIcon(account.type)}
                  selected={values.account_id === account.id}
                  disabled={loading}
                  onSelect={() => selectAccount(account.id)}
                  className="h-12 min-w-28 px-4 text-sm"
                >
                  {account.name}
                </ChoiceChip>
              ))}
            </div>
          </ChipScroller>
        )}
      </Field>

      <Field label="Categoría" errorFor="category_id" error={fieldErrors.category_id}>
        {loadingOptions ? (
          <ChipSkeleton className="h-20 w-24" />
        ) : (
          <ChipScroller>
            <div
              id="category_id"
              tabIndex={-1}
              role="group"
              aria-label="Categoría"
              className="flex gap-2"
            >
              <ChoiceChip
                icon="📦"
                selected={values.category_id === ""}
                disabled={loading}
                onSelect={() => updateField("category_id", "")}
                className="h-20 w-24"
              >
                Sin categoría
              </ChoiceChip>
              {categories.map((category) => (
                <ChoiceChip
                  key={category.id}
                  icon={category.icon?.trim() || "📦"}
                  selected={values.category_id === category.id}
                  disabled={loading}
                  onSelect={() => updateField("category_id", category.id)}
                  className="h-20 w-24"
                >
                  {category.name}
                </ChoiceChip>
              ))}
            </div>
          </ChipScroller>
        )}
      </Field>

      <Field
        label="Método de pago"
        errorFor="payment_method_id"
        error={fieldErrors.payment_method_id}
      >
        {loadingOptions ? (
          <ChipSkeleton className="h-12 w-28" />
        ) : (
          <ChipScroller>
            <div
              id="payment_method_id"
              tabIndex={-1}
              role="group"
              aria-label="Método de pago"
              className="flex gap-2"
            >
              <ChoiceChip
                selected={values.payment_method_id === ""}
                disabled={loading}
                onSelect={() => updateField("payment_method_id", "")}
                className="h-12 min-w-28 text-sm"
              >
                Sin método
              </ChoiceChip>
              {paymentMethods.map((method) => (
                <ChoiceChip
                  key={method.id}
                  selected={values.payment_method_id === method.id}
                  disabled={loading}
                  onSelect={() => updateField("payment_method_id", method.id)}
                  className="h-12 min-w-28 px-4 text-sm"
                >
                  {method.name}
                </ChoiceChip>
              ))}
            </div>
          </ChipScroller>
        )}
      </Field>

      <Field
        label={
          <>
            Comercio <span className="tracking-normal normal-case opacity-70">· opcional</span>
          </>
        }
        htmlFor="merchant"
        error={fieldErrors.merchant}
      >
        <input
          id="merchant"
          name="merchant"
          type="text"
          autoComplete="off"
          maxLength={MERCHANT_MAX_LENGTH}
          value={values.merchant}
          disabled={loading}
          onChange={(event) => updateField("merchant", event.target.value)}
          {...errorProps("merchant", fieldErrors.merchant)}
          className={inputClassName}
          placeholder="Ej. Supermercado Hipermaxi…"
        />
      </Field>

      <Field
        label={
          <>
            Nota <span className="tracking-normal normal-case opacity-70">· opcional</span>
          </>
        }
        htmlFor="description"
        error={fieldErrors.description}
        hint={
          <span
            className={`block text-right tabular-nums ${
              values.description.length > DESCRIPTION_MAX_LENGTH ? "text-expense" : ""
            }`}
          >
            {values.description.length}/{DESCRIPTION_MAX_LENGTH}
          </span>
        }
      >
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={DESCRIPTION_MAX_LENGTH}
          value={values.description}
          disabled={loading}
          onChange={(event) => updateField("description", event.target.value)}
          {...errorProps("description", fieldErrors.description)}
          className={textareaClassName}
          placeholder="Añade un detalle…"
        />
      </Field>

      {shareLock ? (
        <Alert>
          Esta es tu parte de un gasto de {shareLock.payerName}. El monto lo define quien pagó.
          Tú puedes cambiar la categoría y la nota.
        </Alert>
      ) : null}

      {showSplit ? (
        <SplitWithFriends
          enabled={split.enabled}
          onEnabledChange={(enabled) => updateSplit({ enabled })}
          showToggle={!splitRequired}
          hidePayerConsumes={isDebt}
          payerConsumes={split.payerConsumes}
          onPayerConsumesChange={(payerConsumes) => updateSplit({ payerConsumes })}
          mode={split.mode}
          onModeChange={(nextMode) => updateSplit({ mode: nextMode })}
          friends={friends}
          selectedIds={split.friendIds}
          onToggleFriend={toggleFriend}
          payerAmount={split.payerAmount}
          onPayerAmount={(payerAmount) => updateSplit({ payerAmount })}
          friendAmounts={split.friendAmounts}
          onFriendAmount={setFriendAmount}
          totalAmount={values.amount}
          currency={values.currency}
          disabled={loading}
          amountsLocked={amountLocked}
          error={fieldErrors.split}
        />
      ) : null}

      {optionsError ? <Alert>{optionsError}</Alert> : null}
      {formError ? <Alert>{formError}</Alert> : null}

      <div className="sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-10 flex flex-col gap-2">
        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading
            ? mode === "create"
              ? "Guardando…"
              : "Actualizando…"
            : isDebt
              ? "Guardar deuda"
              : mode === "create"
                ? "Guardar transacción"
                : "Guardar cambios"}
        </Button>
      </div>
      <Button variant="ghost" onClick={handleCancel} disabled={loading} className="-mt-3">
        Cancelar
      </Button>
    </form>
  );
}
