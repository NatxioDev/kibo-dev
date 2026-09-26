import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

export default function NewTransactionPage() {
  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/transactions", label: "Transacciones" }}
          title="Nueva transacción"
        />
      </Reveal>
      <Reveal>
        <TransactionForm mode="create" />
      </Reveal>
    </PageShell>
  );
}
