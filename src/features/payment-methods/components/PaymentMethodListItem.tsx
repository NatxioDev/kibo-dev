"use client";

import { useState } from "react";
import { ManagedListItem } from "@/components/ManagedListItem";
import { DeactivatePaymentMethodDialog } from "@/features/payment-methods/components/DeactivatePaymentMethodDialog";
import { paymentMethodIcon } from "@/features/payment-methods/components/paymentMethodIcon";
import { useTogglePaymentMethodActive } from "@/features/payment-methods/hooks/useTogglePaymentMethodActive";
import type { PaymentMethod } from "@/features/transactions/types";

type PaymentMethodListItemProps = {
  paymentMethod: PaymentMethod;
};

export function PaymentMethodListItem({
  paymentMethod,
}: PaymentMethodListItemProps) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const { toggle, error, loading } = useTogglePaymentMethodActive();

  return (
    <>
      <ManagedListItem
        icon={paymentMethodIcon(paymentMethod.name)}
        name={paymentMethod.name}
        href={`/settings/payment-methods/${paymentMethod.id}/edit`}
        isActive={paymentMethod.is_active}
        inactiveLabel="Desactivado"
        loading={loading}
        error={deactivateOpen ? null : error}
        onActivate={() => toggle(paymentMethod.id, true)}
        onRequestDeactivate={() => setDeactivateOpen(true)}
      />
      <DeactivatePaymentMethodDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        paymentMethodId={paymentMethod.id}
        paymentMethodName={paymentMethod.name}
      />
    </>
  );
}
