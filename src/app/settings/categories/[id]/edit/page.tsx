import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
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
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings/categories", label: "Categorías" }}
          title="Editar categoría"
        />
      </Reveal>
      <Reveal>
        <CategoryForm mode="edit" category={result.data} />
      </Reveal>
    </PageShell>
  );
}
