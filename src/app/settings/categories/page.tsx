import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CategoryList } from "@/features/categories/components/CategoryList";
import { listCategories } from "@/features/categories/services/categories.server";

export default async function CategoriesSettingsPage() {
  const result = await listCategories();

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/settings", label: "Perfil" },
          ]}
          fallbackHref="/settings"
          title="Categorías"
          actions={
            <Link
              href="/settings/categories/new"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              + Nueva categoría
            </Link>
          }
        />

        {!result.success ? (
          <p className="rounded-lg border border-expense-border bg-expense-soft px-4 py-3 text-sm text-expense">
            {result.error}
          </p>
        ) : (
          <CategoryList categories={result.data} />
        )}
      </div>
    </main>
  );
}
