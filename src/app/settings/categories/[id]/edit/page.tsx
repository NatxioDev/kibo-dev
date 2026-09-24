import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryForm } from "@/features/categories/components/CategoryForm";
import { getCategory } from "@/features/categories/services/categories.server";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const result = await getCategory(id);

  if (!result.success) {
    notFound();
  }

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header>
          <Link
            href="/settings/categories"
            className="text-sm text-zinc-500 underline"
          >
            Volver
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
            Editar categoría
          </h1>
        </header>
        <CategoryForm mode="edit" category={result.data} />
      </div>
    </main>
  );
}
