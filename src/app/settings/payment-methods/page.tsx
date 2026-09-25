import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListPaymentMethods } from "@/features/payment-methods/application/ListPaymentMethods.application";
import { PaymentMethodList } from "@/features/payment-methods/components/PaymentMethodList";

export default async function PaymentMethodsSettingsPage() {
  const { paymentMethodRepository } = await createServerDependencies();
  const result = await new ListPaymentMethods(paymentMethodRepository).execute();

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/settings", label: "Perfil" },
          ]}
          fallbackHref="/settings"
          title="Métodos de pago"
          actions={
            <Link
              href="/settings/payment-methods/new"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              + Nuevo
            </Link>
          }
        />

        {!result.success ? (
          <p className="rounded-lg border border-expense-border bg-expense-soft px-4 py-3 text-sm text-expense">
            {result.error}
          </p>
        ) : (
          <PaymentMethodList paymentMethods={result.data} />
        )}
      </div>
    </main>
  );
}
