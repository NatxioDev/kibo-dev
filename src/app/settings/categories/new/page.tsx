import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { CategoryForm } from "@/features/categories/components/CategoryForm";

export default function NewCategoryPage() {
  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings/categories", label: "Categorías" }}
          title="Nueva categoría"
        />
      </Reveal>
      <Reveal>
        <CategoryForm mode="create" />
      </Reveal>
    </PageShell>
  );
}
