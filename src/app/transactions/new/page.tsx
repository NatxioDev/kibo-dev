import { PageHeader } from "@/components/PageHeader";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

export default function NewTransactionPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/transactions", label: "Transacciones" },
          ]}
          fallbackHref="/transactions"
          title="Nueva transacción"
        />
        <TransactionForm mode="create" />
      </div>
    </main>
  );
}
