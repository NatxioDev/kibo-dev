import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetTransactionWithRelations } from "@/features/transactions/application/GetTransaction.application";
import { TransactionDetail } from "@/features/transactions/components/TransactionDetail";

type TransactionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const { id } = await params;
  const { transactionRepository } = await createServerDependencies();
  const result = await new GetTransactionWithRelations(
    transactionRepository,
  ).execute(id);

  if (!result.success) {
    notFound();
  }

  const title =
    result.data.merchant?.trim() ||
    result.data.category?.name ||
    "Detalle";

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/transactions", label: "Transacciones" }}
          eyebrow={result.data.type === "INCOME" ? "Ingreso" : "Gasto"}
          title={title}
        />
      </Reveal>
      <TransactionDetail transaction={result.data} />
    </PageShell>
  );
}
