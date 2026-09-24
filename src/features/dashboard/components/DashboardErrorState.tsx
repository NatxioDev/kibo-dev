import Link from "next/link";

export function DashboardErrorState() {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-6 text-center">
      <p className="text-base text-red-700 dark:text-red-300">No pudimos cargar tu resumen.</p>
      <p className="mt-2 text-sm text-red-600/80 dark:text-red-400/80">Intenta nuevamente.</p>
      <Link
        href="/"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 text-sm font-medium text-zinc-800 dark:text-zinc-100"
      >
        Reintentar
      </Link>
    </div>
  );
}
