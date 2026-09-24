import { PageHeader } from "@/components/PageHeader";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";

export default function FeedbackSettingsPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/settings", label: "Perfil" },
          ]}
          fallbackHref="/settings"
          title="Enviar feedback"
          description="Reporta un bug, comparte una idea o déjanos un comentario."
        />
        <FeedbackForm />
      </div>
    </main>
  );
}
