import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListGroup } from "@/components/ui/ListGroup";
import { AccountListItem } from "@/features/accounts/components/AccountListItem";
import type { Account } from "@/features/transactions/types";

type AccountListProps = {
  accounts: Account[];
};

export function AccountList({ accounts }: AccountListProps) {
  if (accounts.length === 0) {
    return (
      <Reveal>
        <EmptyState
          title="Sin cuentas"
          description="Crea tus cuentas de ahorro, efectivo u otras para organizar de dónde sale el dinero."
          action={<Button href="/settings/accounts/new">+ Nueva cuenta</Button>}
        />
      </Reveal>
    );
  }

  const sorted = [...accounts].sort(
    (a, b) => Number(b.is_active) - Number(a.is_active),
  );

  return (
    <Reveal>
      <ListGroup footer="Toca una cuenta para editarla. Las desactivadas no aparecen al registrar transacciones.">
        {sorted.map((account) => (
          <AccountListItem key={account.id} account={account} />
        ))}
      </ListGroup>
    </Reveal>
  );
}
