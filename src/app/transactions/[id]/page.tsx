import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
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
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/transactions", label: "Transacciones" },
          ]}
          fallbackHref="/transactions"
          title={title}
        />
        <TransactionDetail transaction={result.data} />
      </div>
    </main>
  );
}
