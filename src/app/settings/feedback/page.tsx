import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";

export default function FeedbackSettingsPage() {
  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Feedback"
          description="Reporta un bug, comparte una idea o déjanos un comentario."
        />
      </Reveal>
      <Reveal>
        <FeedbackForm />
      </Reveal>
    </PageShell>
  );
}
