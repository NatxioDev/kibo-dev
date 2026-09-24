import Link from "next/link";
import { PaymentMethodForm } from "@/features/payment-methods/components/PaymentMethodForm";

export default function NewPaymentMethodPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header>
          <Link
            href="/settings/payment-methods"
            className="text-sm text-zinc-500 dark:text-zinc-400 underline"
          >
            Volver
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Nuevo método de pago
          </h1>
        </header>
        <PaymentMethodForm mode="create" />
      </div>
    </main>
  );
}
