"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HowItWorks } from "@/components/ui/HowItWorks";
import { showToast } from "@/components/ui/Toast";
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
  const payable = balances.filter(
    (balance) => toCents(balance.iCanPay) > 0 || toCents(balance.theyCanPay) > 0,
  );
  const quiet =
    pending.length === 0 &&
    payable.length === 0 &&
    balances.every((balance) => !balance.inReview);

  if (quiet) return null;

  return (
    <div className="flex flex-col gap-4">
      {payable.map((balance) => (
        <PayForm key={balance.currency} profile={profile} balance={balance} name={name} />
      ))}
      {pending.map((settlement) => (
        <PendingSettlement
          key={settlement.id}
          settlement={settlement}
          profile={profile}
          name={name}
        />
      ))}
      {payable.length === 0 && pending.length === 0 ? (
        <p className="text-sm text-pretty text-muted-foreground">
          Hay una parte en disputa. No se puede saldar hasta resolverla.
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
  const [outcome, setOutcome] = useState<"confirmed" | "rejected" | null>(null);
  const theyPayMe = settlement.debtorId === profile.id;

  function confirm() {
    setError(null);
    setOutcome("confirmed");
    startTransition(async () => {
      const result = await confirmSettlementAction(settlement.id);
      if (!result.success) {
        setOutcome(null);
        setError(result.error);
        return;
      }
      showToast("Pago confirmado");
      router.refresh();
    });
  }

  function reject() {
    setError(null);
    setRejectOpen(false);
    setOutcome("rejected");
    startTransition(async () => {
      const result = await rejectSettlementAction(settlement.id);
      if (!result.success) {
        setOutcome(null);
        setError(result.error);
        return;
      }
      showToast("Pago rechazado");
      router.refresh();
    });
  }

  if (outcome === "confirmed") {
    return <p className="text-sm font-semibold text-foreground">Pago confirmado.</p>;
  }
  if (outcome === "rejected") {
    return <p className="text-sm font-semibold text-foreground">Pago rechazado.</p>;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <p className="text-sm text-pretty text-foreground">
        {theyPayMe
          ? `${name} dice que te pagó ${formatMoneyAmount(settlement.amount, settlement.currency)}.`
          : `Falta que ${name} confirme tu pago de ${formatMoneyAmount(settlement.amount, settlement.currency)}.`}
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
  const [sent, setSent] = useState(false);
  const iPay = toCents(balance.iCanPay) > 0;
  const max = iPay ? balance.iCanPay : balance.theyCanPay;
  const [amount, setAmount] = useState(String(max));
  const currency = Currency.from(balance.currency);
  const numeric = Number(amount);
  const labelAmount =
    Number.isFinite(numeric) && toCents(numeric) > 0 ? numeric : max;

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
    setSent(true);
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
        setSent(false);
        setError(result.error);
        return;
      }
      showToast(
        iPay ? `Pago enviado a ${name}, falta que confirme` : "Pago confirmado",
      );
      router.refresh();
    });
  }

  if (sent) {
    return (
      <p className="text-sm font-semibold text-foreground">
        {iPay ? `Pago enviado a ${name}. Falta que confirme.` : "Pago confirmado."}
      </p>
    );
  }

  return (
    <form
      id={`pagar-${balance.currency}`}
      className="flex flex-col gap-3 border-t border-border pt-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <p className="text-sm text-pretty text-foreground">
        {iPay
          ? `Puedes pagar hasta ${formatMoneyAmount(max, balance.currency)}.`
          : `${name} te debe ${formatMoneyAmount(max, balance.currency)}.`}
      </p>
      <label className="flex flex-col gap-2" htmlFor={`settle-${balance.currency}`}>
        <span className="text-sm font-semibold text-muted-foreground">Monto</span>
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
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {pending
          ? "Enviando…"
          : iPay
            ? `Pagar ${formatMoneyAmount(labelAmount, balance.currency)}`
            : "Registrar que te pagó"}
      </Button>
      <HowItWorks>
        {iPay
          ? "El saldo baja cuando confirme que lo recibió. Kibo no mueve el dinero: el pago se hace en tu banco."
          : "Registrar un pago recibido no entra a tus movimientos. El saldo baja al momento."}
      </HowItWorks>
    </form>
  );
}
