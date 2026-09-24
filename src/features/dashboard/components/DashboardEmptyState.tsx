import Link from "next/link";

export function DashboardEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-8 text-center">
      <p className="text-base text-zinc-600 dark:text-zinc-300">
        Aún no tienes movimientos este período.
      </p>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        Registra tu primer ingreso o gasto para comenzar.
      </p>
      <Link
        href="/transactions/new"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 text-sm font-medium text-zinc-50 dark:text-zinc-900"
      >
        + Registrar transacción
      </Link>
    </div>
  );
}
