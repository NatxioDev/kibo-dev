import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetTransaction } from "@/features/transactions/application/GetTransaction.application";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

type EditTransactionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTransactionPage({
  params,
}: EditTransactionPageProps) {
  const { id } = await params;
  const { transactionRepository } = await createServerDependencies();
  const result = await new GetTransaction(transactionRepository).execute(id);

  if (!result.success) {
    notFound();
  }

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: `/transactions/${id}`, label: "Detalle" }}
          title="Editar transacción"
        />
      </Reveal>
      <Reveal>
        <TransactionForm mode="edit" transaction={result.data} />
      </Reveal>
    </PageShell>
  );
}
