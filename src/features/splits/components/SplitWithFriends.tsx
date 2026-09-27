"use client";

import Link from "next/link";
import { Currency } from "@/core/domain/value-objects";
import type { CurrencyCode } from "@/core/domain/value-objects";
import { AmountInput } from "@/features/transactions/components/AmountInput";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";
import { friendName } from "@/features/friends/components/FriendRow";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import { fromCents, sharesMatchTotal, splitEqual, toCents } from "@/features/splits/domain/splitAmount";
import { Segmented } from "@/components/ui/Segmented";

type SplitWithFriendsProps = {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  showToggle: boolean;
  payerConsumes: boolean;
  onPayerConsumesChange: (value: boolean) => void;
  mode: "equal" | "custom";
  onModeChange: (mode: "equal" | "custom") => void;
  friends: FriendProfile[];
  selectedIds: string[];
  onToggleFriend: (id: string) => void;
  payerAmount: string;
  onPayerAmount: (value: string) => void;
  friendAmounts: Record<string, string>;
  onFriendAmount: (id: string, value: string) => void;
  totalAmount: string;
  currency: CurrencyCode;
  disabled?: boolean;
  amountsLocked?: boolean;
  error?: string;
};

export function SplitWithFriends({
  enabled,
  onEnabledChange,
  showToggle,
  payerConsumes,
  onPayerConsumesChange,
  mode,
  onModeChange,
  friends,
  selectedIds,
  onToggleFriend,
  payerAmount,
  onPayerAmount,
  friendAmounts,
  onFriendAmount,
  totalAmount,
  currency,
  disabled = false,
  amountsLocked = false,
  error,
}: SplitWithFriendsProps) {
  const money = Currency.from(currency);
  const total = Number(totalAmount);
  const hasTotal = Number.isFinite(total) && total > 0;
  const selected = friends.filter((friend) => selectedIds.includes(friend.id));
  const summary = buildSummary({
    hasTotal,
    total,
    currency,
    mode,
    payerConsumes,
    payerAmount,
    friendAmounts,
    selected,
  });

  return (
    <section
      id="split"
      tabIndex={-1}
      aria-labelledby="split-title"
      className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="split-title" className="text-pretty text-base font-semibold text-foreground">
            Dividir con amigos
          </h2>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">
            En tus movimientos queda solo tu parte. Lo demás queda como deuda.
          </p>
        </div>
      </div>

      {showToggle ? (
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl focus-within:ring-2 focus-within:ring-primary/50">
          <input
            type="checkbox"
            name="split-enabled"
            className="h-5 w-5 accent-primary"
            checked={enabled}
            disabled={disabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
          />
          <span className="text-sm font-semibold text-foreground">Dividir este gasto</span>
        </label>
      ) : null}

      {enabled && friends.length === 0 ? (
        <p className="text-sm text-pretty text-muted-foreground">
          Todavía no tienes amigos aceptados.{" "}
          <Link
            href="/friends/requests"
            className="rounded-sm font-semibold text-foreground underline focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Agrégalos por su @username
          </Link>{" "}
          para dividir un gasto.
        </p>
      ) : null}

      {enabled && friends.length > 0 ? (
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2" disabled={disabled || amountsLocked}>
            <legend className="sr-only">Amigos en el reparto</legend>
            <ul className="flex flex-col gap-1">
              {friends.map((friend) => {
                const name = friendName(friend);
                const checked = selectedIds.includes(friend.id);
                return (
                  <li key={friend.id}>
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl px-1 focus-within:ring-2 focus-within:ring-primary/50">
                      <input
                        type="checkbox"
                        name="split-friend"
                        className="h-5 w-5 shrink-0 accent-primary"
                        checked={checked}
                        onChange={() => onToggleFriend(friend.id)}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                        {name}
                      </span>
                      {friend.username ? (
                        <span translate="no" className="max-w-[40%] shrink-0 truncate text-sm text-muted-foreground">
                          @{friend.username}
                        </span>
                      ) : null}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 focus-within:ring-2 focus-within:ring-primary/50">
            <input
              type="checkbox"
              name="payer-consumes"
              className="h-5 w-5 accent-primary"
              checked={payerConsumes}
              disabled={disabled || amountsLocked}
              onChange={(event) => onPayerConsumesChange(event.target.checked)}
            />
            <span className="text-sm text-foreground">Yo también consumí</span>
          </label>

          <Segmented
            label="Tipo de reparto"
            value={mode}
            disabled={disabled || amountsLocked || selectedIds.length === 0}
            onChange={onModeChange}
            options={[
              { value: "equal", label: "Partes iguales" },
              { value: "custom", label: "Montos a mano" },
            ]}
          />

          {mode === "custom" && selected.length > 0 ? (
            <div className="flex flex-col gap-3">
              {payerConsumes ? (
                <label className="flex flex-col gap-1.5" htmlFor="split-payer-amount">
                  <span className="text-sm font-semibold text-foreground">Tu parte</span>
                  <AmountInput
                    id="split-payer-amount"
                    name="split-payer-amount"
                    autoComplete="off"
                    currency={money}
                    value={payerAmount}
                    disabled={disabled || amountsLocked}
                    onValueChange={onPayerAmount}
                    className="h-12 rounded-2xl border border-border bg-surface px-3 tabular-nums"
                  />
                </label>
              ) : null}
              {selected.map((friend) => {
                const name = friendName(friend);
                return (
                  <label key={friend.id} className="flex flex-col gap-1.5" htmlFor={`split-amount-${friend.id}`}>
                    <span className="truncate text-sm font-semibold text-foreground">
                      Parte de {name}
                    </span>
                    <AmountInput
                      id={`split-amount-${friend.id}`}
                      name={`split-amount-${friend.id}`}
                      autoComplete="off"
                      currency={money}
                      value={friendAmounts[friend.id] ?? ""}
                      disabled={disabled || amountsLocked}
                      onValueChange={(value) => onFriendAmount(friend.id, value)}
                      className="h-12 rounded-2xl border border-border bg-surface px-3 tabular-nums"
                    />
                  </label>
                );
              })}
            </div>
          ) : null}

          <div aria-live="polite" className="flex flex-col gap-2 rounded-2xl bg-surface-muted px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Resumen</h3>
            {!hasTotal ? (
              <p className="text-sm text-muted-foreground">Escribe el monto para ver el reparto.</p>
            ) : selected.length === 0 ? (
              <p className="text-sm text-muted-foreground">Elige al menos un amigo.</p>
            ) : (
              <ul className="flex flex-col gap-1.5 text-sm">
                <li className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate">Tu parte</span>
                  <span className="shrink-0 tabular-nums font-semibold">
                    {formatMoneyAmount(summary.payer, currency)}
                  </span>
                </li>
                {summary.lines.map((line) => (
                  <li key={line.id} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate">{line.name} te debe</span>
                    <span className="shrink-0 tabular-nums font-semibold">
                      {formatMoneyAmount(line.amount, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {summary.note ? (
              <p className="text-sm text-pretty text-muted-foreground">{summary.note}</p>
            ) : null}
            {summary.sumError || error ? (
              <p className="text-sm text-expense">{summary.sumError ?? error}</p>
            ) : null}
            {amountsLocked ? (
              <p className="text-sm text-pretty text-muted-foreground">
                Ya hay un pago confirmado. Puedes cambiar la categoría y la nota, no el monto.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function buildSummary({
  hasTotal,
  total,
  currency,
  mode,
  payerConsumes,
  payerAmount,
  friendAmounts,
  selected,
}: {
  hasTotal: boolean;
  total: number;
  currency: CurrencyCode;
  mode: "equal" | "custom";
  payerConsumes: boolean;
  payerAmount: string;
  friendAmounts: Record<string, string>;
  selected: FriendProfile[];
}): {
  payer: number;
  lines: { id: string; name: string; amount: number }[];
  note: string | null;
  sumError: string | null;
} {
  if (!hasTotal || selected.length === 0) {
    return { payer: 0, lines: [], note: null, sumError: null };
  }

  if (mode === "equal") {
    const split = splitEqual(total, selected.length, payerConsumes);
    const payer = fromCents(split.payerCents);
    return {
      payer,
      lines: selected.map((friend, index) => ({
        id: friend.id,
        name: friendName(friend),
        amount: fromCents(split.friendCents[index] ?? 0),
      })),
      note:
        !payerConsumes && toCents(payer) > 0
          ? `Los centavos que sobran (${formatMoneyAmount(payer, currency)}) quedan en tu gasto.`
          : payerConsumes
            ? null
            : "Pagaste por los demás. Tu parte es 0.",
      sumError: null,
    };
  }

  const payer = payerConsumes ? Number(payerAmount || 0) : 0;
  const lines = selected.map((friend) => ({
    id: friend.id,
    name: friendName(friend),
    amount: Number(friendAmounts[friend.id] || 0),
  }));
  const matches = sharesMatchTotal(
    total,
    payer,
    lines.map((line) => line.amount),
  );

  return {
    payer,
    lines,
    note: null,
    sumError: matches ? null : "La suma de las partes tiene que ser el total. Ajusta los montos.",
  };
}
