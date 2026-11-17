import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListNotifications } from "@/features/notifications/application/ListNotifications.application";
import { MarkAllReadButton } from "@/features/notifications/components/MarkAllReadButton";
import { NotificationList } from "@/features/notifications/components/NotificationList";

const PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 300;

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ limit?: string }>;
}) {
  const { limit: rawLimit } = await searchParams;
  const parsed = Number(rawLimit);
  const limit = Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, PAGE_SIZE), MAX_PAGE_SIZE)
    : PAGE_SIZE;

  const { notificationRepository } = await createServerDependencies();
  const result = await new ListNotifications(notificationRepository).execute(
    limit,
  );

  if (!result.success) {
    return (
      <PageShell>
        <Reveal>
          <PageHeader
            back={{ href: "/", label: "Inicio" }}
            title="Notificaciones"
          />
        </Reveal>
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      </PageShell>
    );
  }

  const groups = result.data;
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const hasMore = total >= limit;

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/", label: "Inicio" }}
          title="Notificaciones"
          actions={total > 0 ? <MarkAllReadButton /> : null}
        />
      </Reveal>

      <NotificationList groups={groups} />

      {hasMore ? (
        <Reveal>
          <div className="flex justify-center">
            <Button href={`/notifications?limit=${limit + PAGE_SIZE}`} variant="secondary" size="sm">
              Ver más
            </Button>
          </div>
        </Reveal>
      ) : null}
    </PageShell>
  );
}
