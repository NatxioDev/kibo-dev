"use client";

import { useState } from "react";
import { ManagedListItem } from "@/components/ManagedListItem";
import { accountIcon } from "@/features/accounts/components/accountIcon";
import { DeactivateAccountDialog } from "@/features/accounts/components/DeactivateAccountDialog";
import { useToggleAccountActiveWithAction } from "@/features/accounts/hooks/useToggleAccountActiveWithAction";
import { ACCOUNT_TYPE_LABELS } from "@/features/accounts/schemas/accountSchema";
import type { Account } from "@/features/transactions/types";

type AccountListItemProps = {
  account: Account;
};

export function AccountListItem({ account }: AccountListItemProps) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const { toggle, error, loading } = useToggleAccountActiveWithAction();

  return (
    <>
      <ManagedListItem
        icon={accountIcon(account.type)}
        name={account.name}
        subtitle={`${ACCOUNT_TYPE_LABELS[account.type]} · ${account.currency}`}
        href={`/settings/accounts/${account.id}/edit`}
        isActive={account.is_active}
        inactiveLabel="Desactivada"
        loading={loading}
        error={deactivateOpen ? null : error}
        onActivate={() => toggle(account.id, true)}
        onRequestDeactivate={() => setDeactivateOpen(true)}
      />
      <DeactivateAccountDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        accountId={account.id}
        accountName={account.name}
      />
    </>
  );
}
