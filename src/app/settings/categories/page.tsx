import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListCategories } from "@/features/categories/application/ListCategories.application";
import { CategoryList } from "@/features/categories/components/CategoryList";

export default async function CategoriesSettingsPage() {
  const { categoryRepository } = await createServerDependencies();
  const result = await new ListCategories(categoryRepository).execute();

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Categorías"
          actions={
            <Button href="/settings/categories/new" size="sm">
              + Nueva
            </Button>
          }
        />
      </Reveal>

      {!result.success ? (
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      ) : (
        <CategoryList categories={result.data} />
      )}
    </PageShell>
  );
}
