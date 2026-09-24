import Link from "next/link";
import { PaymentMethodList } from "@/features/payment-methods/components/PaymentMethodList";
import { listPaymentMethods } from "@/features/payment-methods/services/paymentMethods.server";

export default async function PaymentMethodsSettingsPage() {
  const result = await listPaymentMethods();

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <Link href="/settings" className="text-sm text-zinc-500 underline">
              Configuración
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
              Métodos de pago
            </h1>
          </div>
          <Link
            href="/settings/payment-methods/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-900"
          >
            + Nuevo
          </Link>
        </header>

        {!result.success ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {result.error}
          </p>
        ) : (
          <PaymentMethodList paymentMethods={result.data} />
        )}
      </div>
    </main>
  );
}
