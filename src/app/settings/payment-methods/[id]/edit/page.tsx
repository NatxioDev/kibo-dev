import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PaymentMethodForm } from "@/features/payment-methods/components/PaymentMethodForm";
import { getPaymentMethod } from "@/features/payment-methods/services/paymentMethods.server";

type EditPaymentMethodPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPaymentMethodPage({
  params,
}: EditPaymentMethodPageProps) {
  const { id } = await params;
  const result = await getPaymentMethod(id);

  if (!result.success) {
    notFound();
  }

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
          title="Editar método de pago"
        />
        <PaymentMethodForm mode="edit" paymentMethod={result.data} />
      </div>
    </main>
  );
}
