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
  const { transactionRepository, splitRepository } = await createServerDependencies();
  const [result, link] = await Promise.all([
    new GetTransactionWithRelations(transactionRepository).execute(id),
    splitRepository.findByTransaction(id),
  ]);

  if (!result.success) {
    notFound();
  }

  const title =
    result.data.merchant?.trim() ||
    result.data.category?.name ||
    "Detalle";

  const shared = link.success ? link.data : null;
  const sharedNotice = shared
    ? shared.isPayer
      ? "Este gasto está dividido. En tus movimientos quedó solo tu parte."
      : `Esta es tu parte de un gasto de ${shared.payerName}.`
    : null;
  const deleteDescription = shared?.isPayer
    ? "Se anula para todos y sale de los movimientos. El historial de la deuda se conserva. Si ya hubo un pago confirmado, no se puede eliminar."
    : undefined;

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/transactions", label: "Transacciones" }}
          eyebrow={result.data.type === "INCOME" ? "Ingreso" : "Gasto"}
          title={title}
        />
      </Reveal>
      <TransactionDetail
        transaction={result.data}
        sharedNotice={sharedNotice}
        deleteDescription={deleteDescription}
      />
    </PageShell>
  );
}
