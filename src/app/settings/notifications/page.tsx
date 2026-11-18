import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { NotificationPreferences } from "@/features/notifications/components/NotificationPreferences";
import { PushSubscriptionCard } from "@/features/notifications/components/PushSubscriptionCard";

export default async function NotificationSettingsPage() {
  const { notificationRepository } = await createServerDependencies();
  const result = await notificationRepository.getPreferences();

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Notificaciones"
          description="Elige qué te avisamos y en qué dispositivos."
        />
      </Reveal>

      <Reveal>
        <PushSubscriptionCard />
      </Reveal>

      <Reveal>
        {result.success ? (
          <NotificationPreferences initial={result.data} />
        ) : (
          <Alert>{result.error}</Alert>
        )}
      </Reveal>

      <Reveal>
        <p className="px-4 text-sm text-pretty text-muted-foreground">
          Las notificaciones dentro de Kibo aparecen siempre, aunque desactives
          el push en este dispositivo.
        </p>
      </Reveal>
    </PageShell>
  );
}
