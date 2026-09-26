import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { PaymentMethodForm } from "@/features/payment-methods/components/PaymentMethodForm";

export default function NewPaymentMethodPage() {
  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings/payment-methods", label: "Métodos de pago" }}
          title="Nuevo método"
        />
      </Reveal>
      <Reveal>
        <PaymentMethodForm mode="create" />
      </Reveal>
    </PageShell>
  );
}
