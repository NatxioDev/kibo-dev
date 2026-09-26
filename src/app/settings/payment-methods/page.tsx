import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListPaymentMethods } from "@/features/payment-methods/application/ListPaymentMethods.application";
import { PaymentMethodList } from "@/features/payment-methods/components/PaymentMethodList";

export default async function PaymentMethodsSettingsPage() {
  const { paymentMethodRepository } = await createServerDependencies();
  const result = await new ListPaymentMethods(paymentMethodRepository).execute();

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Métodos de pago"
          actions={
            <Button href="/settings/payment-methods/new" size="sm">
              + Nuevo
            </Button>
          }
        />
      </Reveal>

      {!result.success ? (
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      ) : (
        <PaymentMethodList paymentMethods={result.data} />
      )}
    </PageShell>
  );
}
