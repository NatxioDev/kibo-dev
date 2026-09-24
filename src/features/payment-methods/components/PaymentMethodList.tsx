import Link from "next/link";
import { PaymentMethodListItem } from "@/features/payment-methods/components/PaymentMethodListItem";
import type { PaymentMethod } from "@/features/transactions/types";

type PaymentMethodListProps = {
  paymentMethods: PaymentMethod[];
};

export function PaymentMethodList({ paymentMethods }: PaymentMethodListProps) {
  if (paymentMethods.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 px-4 py-10 text-center">
        <p className="text-base text-zinc-300">
          No tienes métodos de pago todavía.
        </p>
        <Link
          href="/settings/payment-methods/new"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-900"
        >
          + Nuevo método de pago
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {paymentMethods.map((paymentMethod) => (
        <PaymentMethodListItem
          key={paymentMethod.id}
          paymentMethod={paymentMethod}
        />
      ))}
    </div>
  );
}
