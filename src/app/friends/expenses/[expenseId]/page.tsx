import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListCategories } from "@/features/categories/application/ListCategories.application";
import { friendName } from "@/features/friends/components/FriendRow";
import { UnclassifiedInbox } from "@/features/splits/components/UnclassifiedInbox";
import type { AttentionShare, SharedExpenseDetail } from "@/features/splits/domain/models";
import {
  formatMoneyAmount,
  formatTransactionDate,
} from "@/features/transactions/components/formatters";
import type { Category } from "@/features/transactions/domain/models";

export const metadata = {
  robots: { index: false, follow: false },
};

type SharedExpensePageProps = {
  params: Promise<{ expenseId: string }>;
};

export default async function SharedExpensePage({ params }: SharedExpensePageProps) {
  const { expenseId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(expenseId)) notFound();

  const { splitRepository, categoryRepository } = await createServerDependencies();
  const result = await splitRepository.shareDetail(expenseId);
  if (!result.success) notFound();

  const detail = result.data;
  const payerName = friendName(detail.payer);
  const isDebtor = detail.role === "debtor";

  const needsAttention =
    isDebtor &&
    (detail.shareStatus === "pending" || detail.shareStatus === "disputed");
  const attention: AttentionShare[] = needsAttention
    ? [
        {
          id: detail.shareId,
          amount: detail.myAmount,
          currency: detail.currency,
          status: detail.shareStatus === "disputed" ? "disputed" : "pending",
          categoryNameSnapshot: detail.categoryNameSnapshot,
          role: detail.shareStatus === "disputed" ? "mine" : "classify",
          date: detail.date,
          merchant: detail.merchant,
          description: detail.description,
          counterpart: detail.payer,
        },
      ]
    : [];

  let categories: Category[] = [];
  if (attention.length > 0) {
    const listed = await new ListCategories(categoryRepository).execute();
    categories = listed.success
      ? listed.data.filter((category) => category.type === "EXPENSE" && category.is_active)
      : [];
  }

  const title =
    detail.merchant?.trim() || detail.description?.trim() || "Gasto compartido";

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={
            isDebtor
              ? { href: `/friends/${detail.payer.id}`, label: payerName }
              : { href: "/friends", label: "Amigos" }
          }
          title={title}
          description={formatTransactionDate(detail.date)}
          actions={
            isDebtor ? null : (
              <Button
                href={`/friends/expenses/${expenseId}/edit`}
                size="sm"
                variant="secondary"
              >
                Editar
              </Button>
            )
          }
        />
      </Reveal>

      <Reveal>
        <dl className="glass divide-y divide-track overflow-hidden rounded-card border border-border bg-surface shadow-card">
          <Row
            label="Tu parte"
            value={formatMoneyAmount(detail.myAmount, detail.currency)}
            emphasis
          />
          <Row
            label="Total del gasto"
            value={formatMoneyAmount(detail.totalAmount, detail.currency)}
          />
          <Row label="Pagó" value={isDebtor ? payerName : "Tú"} />
          <Row label="Estado" value={statusLabel(detail)} />
          {detail.description && detail.merchant ? (
            <Row label="Nota" value={detail.description} />
          ) : null}
        </dl>
      </Reveal>

      {attention.length > 0 ? (
        <Reveal>
          <UnclassifiedInbox items={attention} categories={categories} />
        </Reveal>
      ) : null}
    </PageShell>
  );
}

function statusLabel(detail: SharedExpenseDetail): string {
  if (detail.expenseStatus === "voided" || detail.shareStatus === "voided") {
    return "Anulado";
  }
  if (detail.shareStatus === "disputed") return "En revisión";
  if (detail.shareStatus === "pending") return "Por clasificar";
  return "Clasificado";
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd
        className={
          emphasis
            ? "text-right font-display text-xl font-extrabold tabular-nums text-foreground"
            : "text-right text-sm font-semibold text-pretty text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  );
}
