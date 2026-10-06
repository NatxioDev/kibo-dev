"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { friendName } from "@/features/friends/components/FriendRow";
import {
  classifyShareAction,
  disputeShareAction,
  withdrawDisputeAction,
} from "@/features/splits/actions/split.action";
import type { AttentionShare } from "@/features/splits/domain/models";
import type { Category } from "@/features/transactions/domain/models";
import { formatMoneyAmount } from "@/features/transactions/components/formatters";

type UnclassifiedInboxProps = {
  items: AttentionShare[];
  categories: Category[];
};

export function UnclassifiedInbox({ items, categories }: UnclassifiedInboxProps) {
  const toClassify = items.filter((item) => item.role === "classify");
  const mine = items.filter((item) => item.role === "mine");
  const payer = items.filter((item) => item.role === "payer");

  if (toClassify.length === 0 && mine.length === 0 && payer.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      {toClassify.length > 0 ? (
        <section className="flex flex-col gap-2" aria-labelledby="inbox-title">
          <h2
            id="inbox-title"
            className="px-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase"
          >
            Por clasificar · {toClassify.length}
          </h2>
          <ul className="flex flex-col gap-3">
            {toClassify.map((item) => (
              <ClassifyCard key={item.id} item={item} categories={categories} />
            ))}
          </ul>
        </section>
      ) : null}
      {mine.length > 0 ? (
        <ReviewList
          title="En revisión"
          items={mine}
          actionLabel="Sí lo reconozco"
          onAction={withdrawDisputeAction}
        />
      ) : null}
      {payer.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="px-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            No reconocen un gasto
          </h2>
          <ul className="glass divide-y divide-track overflow-hidden rounded-card border border-border bg-surface shadow-card">
            {payer.map((item) => (
              <li key={item.id} className="px-4 py-3 text-sm text-pretty text-foreground">
                <span className="font-semibold">{friendName(item.counterpart)}</span> no reconoce{" "}
                <span className="tabular-nums font-semibold">
                  {formatMoneyAmount(item.amount, item.currency)}
                </span>
                {item.merchant ? ` de ${item.merchant}` : ""}. La deuda sigue en el saldo, en revisión.
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ClassifyCard({
  item,
  categories,
}: {
  item: AttentionShare;
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const suggested = categories.find(
    (category) =>
      item.categoryNameSnapshot != null &&
      category.name.localeCompare(item.categoryNameSnapshot, "es", { sensitivity: "accent" }) === 0,
  );
  const [categoryId, setCategoryId] = useState(suggested?.id ?? "");
  const title = item.merchant?.trim() || item.description?.trim() || "Gasto compartido";
  const payer = friendName(item.counterpart);

  function classify() {
    if (!categoryId) {
      setError("Elige una de tus categorías para guardarlo en tus movimientos.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await classifyShareAction(item.id, categoryId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function dispute() {
    setError(null);
    startTransition(async () => {
      const result = await disputeShareAction(item.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          Pagó {payer}
          {item.description && item.merchant ? ` · ${item.description}` : ""}
        </p>
      </div>
      <p className="font-display text-3xl font-extrabold tabular-nums tracking-tight">
        {formatMoneyAmount(item.amount, item.currency)}
      </p>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-foreground mb-2">Tu categoría</legend>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tienes categorías de gasto activas. Crea una en Ajustes para clasificarlo.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={pending}
                  onClick={() => {
                    setCategoryId(category.id);
                    setError(null);
                  }}
                  className={`h-10 max-w-full truncate rounded-2xl border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    selected
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
        {suggested && categoryId === suggested.id ? (
          <p className="text-sm text-muted-foreground">
            Sugerida porque tienes una categoría con el mismo nombre.
          </p>
        ) : null}
      </fieldset>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex flex-row gap-2">
        <Button type="button" disabled={pending} onClick={classify} className="flex-1">
          {pending && !confirmOpen ? "Guardando…" : "Clasificar"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => setConfirmOpen(true)}
          className="flex-1"
        >
          No reconozco esto
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="¿No reconoces este gasto?"
        description={`${payer} se va a enterar. La deuda queda en revisión y no se puede saldar hasta que la resuelvan.`}
        confirmLabel="No reconozco esto"
        pendingLabel="Marcando…"
        loading={pending && confirmOpen}
        error={null}
        onConfirm={dispute}
        onClose={() => {
          if (!pending) setConfirmOpen(false);
        }}
      />
    </li>
  );
}

function ReviewList({
  title,
  items,
  actionLabel,
  onAction,
}: {
  title: string;
  items: AttentionShare[];
  actionLabel: string;
  onAction: (shareId: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-4 text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h2>
      <ul className="glass divide-y divide-track overflow-hidden rounded-card border border-border bg-surface shadow-card">
        {items.map((item) => (
          <li key={item.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-semibold">
                {item.merchant?.trim() || "Gasto compartido"} · {friendName(item.counterpart)}
              </p>
              <span className="shrink-0 text-sm tabular-nums font-semibold">
                {formatMoneyAmount(item.amount, item.currency)}
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pendingId === item.id}
              onClick={() => {
                setError(null);
                setPendingId(item.id);
                void onAction(item.id).then((result) => {
                  setPendingId(null);
                  if (!result.success) {
                    setError(result.error ?? "No pudimos actualizar el gasto.");
                    return;
                  }
                  router.refresh();
                });
              }}
            >
              {pendingId === item.id ? "Guardando…" : actionLabel}
            </Button>
          </li>
        ))}
      </ul>
      {error ? <Alert>{error}</Alert> : null}
    </section>
  );
}
