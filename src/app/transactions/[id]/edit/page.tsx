import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
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
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/transactions", label: "Transacciones" },
          ]}
          fallbackHref="/transactions"
          title="Editar transacción"
        />
        <TransactionForm mode="edit" transaction={result.data} />
      </div>
    </main>
  );
}
