"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { ListGroup, ListRow } from "@/components/ui/ListGroup";
import { Switch } from "@/components/ui/Switch";
import { updateNotificationPreferencesAction } from "@/features/notifications/actions/notification.action";
import type { NotificationPreferences as Preferences } from "@/features/notifications/domain/models/Notification";

type PreferenceKey = "shared_expenses" | "payments" | "releases";

const CATEGORIES: Array<{
  key: PreferenceKey;
  icon: string;
  title: string;
  subtitle: string;
}> = [
  {
    key: "shared_expenses",
    icon: "🤝",
    title: "Cobros compartidos",
    subtitle: "Cuando te crean, actualizan o anulan un cobro",
  },
  {
    key: "payments",
    icon: "💸",
    title: "Pagos",
    subtitle: "Cuando confirman o rechazan un pago",
  },
  {
    key: "releases",
    icon: "✨",
    title: "Novedades",
    subtitle: "Cuando sale una versión nueva de Kibo",
  },
];

export function NotificationPreferences({ initial }: { initial: Preferences }) {
  const [preferences, setPreferences] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(key: PreferenceKey) {
    const previous = preferences;
    const next = { ...preferences, [key]: !preferences[key] };

    setPreferences(next);
    setError(null);

    startTransition(async () => {
      const result = await updateNotificationPreferencesAction({
        sharedExpenses: next.shared_expenses,
        payments: next.payments,
        releases: next.releases,
      });

      if (!result.success) {
        setPreferences(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <ListGroup title="Qué te avisamos">
        {CATEGORIES.map((category) => (
          <ListRow
            key={category.key}
            icon={category.icon}
            title={category.title}
            subtitle={category.subtitle}
            trailing={
              <Switch
                checked={preferences[category.key]}
                onChange={() => toggle(category.key)}
                disabled={isPending}
                label={category.title}
              />
            }
          />
        ))}
      </ListGroup>

      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
