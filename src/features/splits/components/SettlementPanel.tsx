"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Currency } from "@/core/domain/value-objects";
import { friendName } from "@/features/friends/components/FriendRow";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import {
  confirmSettlementAction,
  recordReceivedPaymentAction,
  rejectSettlementAction,
  requestSettlementAction,
} from "@/features/splits/actions/split.action";
import type { CurrencyBalance, SettlementView } from "@/features/splits/domain/models";
import { toCents } from "@/features/splits/domain/splitAmount";
import { AmountInput } from "@/features/transactions/components/AmountInput";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";

type SettlementPanelProps = {
  profile: FriendProfile;
  balances: CurrencyBalance[];
  pending: SettlementView[];
};

export function SettlementPanel({ profile, balances, pending }: SettlementPanelProps) {
  const name = friendName(profile);
  const quiet =
    pending.length === 0 &&
    balances.every((balance) => toCents(balance.net) === 0 && !balance.inReview);

  if (quiet) return null;

  const payable = balances.filter(
    (balance) => toCents(balance.iCanPay) > 0 || toCents(balance.theyCanPay) > 0,
  );

  return (
    <div className="flex flex-col gap-4">
      {pending.map((settlement) => (
        <PendingSettlement
          key={settlement.id}
          settlement={settlement}
          profile={profile}
          name={name}
        />
      ))}
      {payable.map((balance) => (
        <PayForm key={balance.currency} profile={profile} balance={balance} name={name} />
      ))}
      {payable.length === 0 && pending.length === 0 ? (
        <p className="text-sm text-pretty text-muted-foreground">
          {balances.some((balance) => balance.inReview)
            ? "Hay una parte en revisión. No se puede saldar hasta que la resuelvan."
            : "No hay un saldo para saldar."}
        </p>
      ) : null}
    </div>
  );
}

function PendingSettlement({
  settlement,
  profile,
  name,
}: {
  settlement: SettlementView;
  profile: FriendProfile;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const theyPayMe = settlement.debtorId === profile.id;

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmSettlementAction(settlement.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const result = await rejectSettlementAction(settlement.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setRejectOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
      <p className="text-sm text-pretty text-foreground">
        {theyPayMe
          ? `${name} dice que te pagó ${formatMoneyAmount(settlement.amount, settlement.currency)}.`
          : `Esperando que ${name} confirme tu pago de ${formatMoneyAmount(settlement.amount, settlement.currency)}.`}
      </p>
      {error ? <Alert>{error}</Alert> : null}
      {theyPayMe ? (
        <div className="flex gap-2">
          <Button
            type="button"
            loading={pending && !rejectOpen}
            disabled={pending}
            onClick={confirm}
            className="flex-1"
          >
            {pending && !rejectOpen ? "Confirmando…" : "Recibido"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setRejectOpen(true)}
            className="flex-1"
          >
            Rechazar
          </Button>
        </div>
      ) : null}
      <ConfirmDialog
        open={rejectOpen}
        title="¿Rechazar este pago?"
        description="El saldo no cambia. La otra persona puede volver a marcarlo."
        confirmLabel="Rechazar pago"
        pendingLabel="Rechazando…"
        loading={pending && rejectOpen}
        onConfirm={reject}
        onClose={() => {
          if (!pending) setRejectOpen(false);
        }}
      />
    </div>
  );
}

function PayForm({
  profile,
  balance,
  name,
}: {
  profile: FriendProfile;
  balance: CurrencyBalance;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const iPay = toCents(balance.iCanPay) > 0;
  const max = iPay ? balance.iCanPay : balance.theyCanPay;
  const [amount, setAmount] = useState(String(max));
  const currency = Currency.from(balance.currency);

  function submit() {
    const value = Number(amount);
    if (!Number.isFinite(value) || toCents(value) <= 0) {
      setError("Escribe un monto mayor que 0.");
      return;
    }
    if (toCents(value) > toCents(max)) {
      setError(`El máximo que puedes registrar es ${formatMoneyAmount(max, balance.currency)}.`);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = iPay
        ? await requestSettlementAction({
            userId: profile.id,
            amount: value,
            currency: balance.currency,
          })
        : await recordReceivedPaymentAction({
            userId: profile.id,
            amount: value,
            currency: balance.currency,
          });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <p className="text-sm text-pretty text-foreground">
        {iPay
          ? `Le debes ${formatMoneyAmount(balance.iCanPay, balance.currency)} a ${name}. El saldo baja cuando confirme que lo recibió.`
          : `${name} te debe ${formatMoneyAmount(balance.theyCanPay, balance.currency)}. Registrar un pago recibido no entra a tus movimientos.`}
      </p>
      <label className="flex flex-col gap-1.5" htmlFor={`settle-${balance.currency}`}>
        <span className="text-sm font-semibold">Monto</span>
        <AmountInput
          id={`settle-${balance.currency}`}
          name={`settle-${balance.currency}`}
          autoComplete="off"
          currency={currency}
          value={amount}
          disabled={pending}
          onValueChange={setAmount}
          className="h-12 rounded-2xl border border-border bg-surface px-3 tabular-nums"
        />
      </label>
      {error ? <Alert>{error}</Alert> : null}
      <Button type="submit" loading={pending}>
        {pending ? "Guardando…" : iPay ? "Ya pagué" : "Registrar pago recibido"}
      </Button>
    </form>
  );
}
