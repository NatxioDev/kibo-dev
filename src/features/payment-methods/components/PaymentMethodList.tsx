import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListGroup } from "@/components/ui/ListGroup";
import { PaymentMethodListItem } from "@/features/payment-methods/components/PaymentMethodListItem";
import type { PaymentMethod } from "@/features/transactions/types";

type PaymentMethodListProps = {
  paymentMethods: PaymentMethod[];
};

export function PaymentMethodList({ paymentMethods }: PaymentMethodListProps) {
  if (paymentMethods.length === 0) {
    return (
      <Reveal>
        <EmptyState
          icon="💳"
          title="Sin métodos de pago"
          description="Agrega efectivo, tarjetas o QR para saber cómo pagas."
          action={
            <Button href="/settings/payment-methods/new">+ Nuevo método</Button>
          }
        />
      </Reveal>
    );
  }

  const sorted = [...paymentMethods].sort(
    (a, b) => Number(b.is_active) - Number(a.is_active),
  );

  return (
    <Reveal>
      <ListGroup footer="Toca un método para editarlo. Los desactivados no aparecen al registrar transacciones.">
        {sorted.map((paymentMethod) => (
          <PaymentMethodListItem
            key={paymentMethod.id}
            paymentMethod={paymentMethod}
          />
        ))}
      </ListGroup>
    </Reveal>
  );
}
