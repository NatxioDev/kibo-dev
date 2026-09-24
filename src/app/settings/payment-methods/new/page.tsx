import { PageHeader } from "@/components/PageHeader";
import { PaymentMethodForm } from "@/features/payment-methods/components/PaymentMethodForm";

export default function NewPaymentMethodPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/settings", label: "Perfil" },
            { href: "/settings/payment-methods", label: "Métodos de pago" },
          ]}
          fallbackHref="/settings/payment-methods"
          title="Nuevo método de pago"
        />
        <PaymentMethodForm mode="create" />
      </div>
    </main>
  );
}
