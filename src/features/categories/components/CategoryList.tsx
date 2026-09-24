import Link from "next/link";
import { CategoryListItem } from "@/features/categories/components/CategoryListItem";
import type { Category } from "@/features/transactions/types";

type CategoryListProps = {
  categories: Category[];
};

export function CategoryList({ categories }: CategoryListProps) {
  const expenses = categories.filter((category) => category.type === "EXPENSE");
  const incomes = categories.filter((category) => category.type === "INCOME");

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-700 px-4 py-10 text-center">
        <p className="text-base text-zinc-300">
          No tienes categorías todavía.
        </p>
        <Link
          href="/settings/categories/new"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-900"
        >
          + Nueva categoría
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Gastos
        </h2>
        {expenses.length === 0 ? (
          <p className="py-3 text-sm text-zinc-500">Sin categorías de gasto.</p>
        ) : (
          expenses.map((category) => (
            <CategoryListItem key={category.id} category={category} />
          ))
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Ingresos
        </h2>
        {incomes.length === 0 ? (
          <p className="py-3 text-sm text-zinc-500">
            Sin categorías de ingreso.
          </p>
        ) : (
          incomes.map((category) => (
            <CategoryListItem key={category.id} category={category} />
          ))
        )}
      </section>
    </div>
  );
}
