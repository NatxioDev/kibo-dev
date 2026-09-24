import Link from "next/link";
import { CategoryList } from "@/features/categories/components/CategoryList";
import { listCategories } from "@/features/categories/services/categories.server";

export default async function CategoriesSettingsPage() {
  const result = await listCategories();

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <Link href="/settings" className="text-sm text-zinc-500 dark:text-zinc-400 underline">
              Configuración
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Categorías
            </h1>
          </div>
          <Link
            href="/settings/categories/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 text-sm font-medium text-zinc-50 dark:text-zinc-900"
          >
            + Nueva categoría
          </Link>
        </header>

        {!result.success ? (
          <p className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {result.error}
          </p>
        ) : (
          <CategoryList categories={result.data} />
        )}
      </div>
    </main>
  );
}
