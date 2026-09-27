import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListFriendships } from "@/features/friends/application/ListFriendships.application";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import { VoidExpenseButton } from "@/features/splits/components/VoidExpenseButton";
import { GetTransaction } from "@/features/transactions/application/GetTransaction.application";
import { TransactionForm } from "@/features/transactions/components/TransactionForm";

type EditTransactionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const { id } = await params;
  const { transactionRepository, splitRepository, friendshipRepository } =
    await createServerDependencies();
  const [result, link, friends] = await Promise.all([
    new GetTransaction(transactionRepository).execute(id),
    splitRepository.findByTransaction(id),
    new ListFriendships(friendshipRepository).execute(),
  ]);

  if (!result.success) notFound();

  const accepted: FriendProfile[] = friends.success
    ? friends.data.friends.map((item) => item.friend)
    : [];
  const bill =
    link.success && link.data?.isPayer
      ? await splitRepository.getEditContext(link.data.expenseId)
      : null;
  const shareLock =
    link.success && link.data && !link.data.isPayer
      ? { payerName: link.data.payerName }
      : null;

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: `/transactions/${id}`, label: "Detalle" }}
          title="Editar transacción"
        />
      </Reveal>
      <Reveal>
        <TransactionForm
          mode="edit"
          transaction={result.data}
          friends={accepted}
          bill={bill && bill.success ? bill.data : null}
          shareLock={shareLock}
        />
      </Reveal>
      {bill && bill.success ? (
        <Reveal>
          <VoidExpenseButton expenseId={bill.data.expenseId} />
        </Reveal>
      ) : null}
    </PageShell>
  );
}
