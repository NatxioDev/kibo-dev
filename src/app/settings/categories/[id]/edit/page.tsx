import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetCategory } from "@/features/categories/application/GetCategory.application";
import { CategoryForm } from "@/features/categories/components/CategoryForm";

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const { categoryRepository } = await createServerDependencies();
  const result = await new GetCategory(categoryRepository).execute(id);

  if (!result.success) {
    notFound();
  }

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/settings", label: "Perfil" },
            { href: "/settings/categories", label: "Categorías" },
          ]}
          fallbackHref="/settings/categories"
          title="Editar categoría"
        />
        <CategoryForm mode="edit" category={result.data} />
      </div>
    </main>
  );
}
