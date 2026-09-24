import { PageHeader } from "@/components/PageHeader";
import { CategoryForm } from "@/features/categories/components/CategoryForm";

export default function NewCategoryPage() {
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
          title="Nueva categoría"
        />
        <CategoryForm mode="create" />
      </div>
    </main>
  );
}
