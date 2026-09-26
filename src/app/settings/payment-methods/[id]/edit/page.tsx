import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetPaymentMethod } from "@/features/payment-methods/application/GetPaymentMethod.application";
import { PaymentMethodForm } from "@/features/payment-methods/components/PaymentMethodForm";

type EditPaymentMethodPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPaymentMethodPage({
  params,
}: EditPaymentMethodPageProps) {
  const { id } = await params;
  const { paymentMethodRepository } = await createServerDependencies();
  const result = await new GetPaymentMethod(paymentMethodRepository).execute(
    id,
  );

  if (!result.success) {
    notFound();
  }

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings/payment-methods", label: "Métodos de pago" }}
          title="Editar método"
        />
      </Reveal>
      <Reveal>
        <PaymentMethodForm mode="edit" paymentMethod={result.data} />
      </Reveal>
    </PageShell>
  );
}
