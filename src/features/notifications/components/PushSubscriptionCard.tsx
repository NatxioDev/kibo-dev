"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ListGroup, ListRow } from "@/components/ui/ListGroup";
import { Switch } from "@/components/ui/Switch";
import type { PushSupportState } from "@/features/notifications/domain/pushSupport";
import { usePushSubscription } from "@/features/notifications/hooks/usePushSubscription";

const SUBTITLES: Record<PushSupportState | "loading", string> = {
  loading: "Revisando este dispositivo…",
  available: "Toca Activar para recibir avisos acá.",
  subscribed: "Activadas en este dispositivo.",
  denied: "Bloqueadas por el navegador.",
  "ios-not-installed": "En iPhone necesitas instalar Kibo.",
  "in-app-browser": "Abre Kibo en tu navegador habitual.",
  unsupported: "Este navegador no soporta push.",
  unconfigured: "Notificaciones no configuradas.",
};

const HINTS: Partial<Record<PushSupportState, { tone: "info" | "error"; text: string }>> = {
  denied: {
    tone: "info",
    text: "Las bloqueaste antes. Reactívalas desde los ajustes del navegador o del sistema: iPhone → Ajustes → Kibo → Notificaciones; Android o desktop → el candado junto a la dirección.",
  },
  "in-app-browser": {
    tone: "info",
    text: "Estás dentro de otra app (Instagram, WhatsApp, TikTok…). Abre Kibo en Chrome o Safari para activar las notificaciones.",
  },
  unsupported: {
    tone: "info",
    text: "Tu navegador no soporta notificaciones push. Prueba con Chrome en Android o Safari en iPhone con iOS 16.4 o superior.",
  },
  unconfigured: {
    tone: "error",
    text: "Faltan las claves de Web Push en este entorno. Avisa a quien administra Kibo.",
  },
  "ios-not-installed": {
    tone: "info",
    text: "En iPhone y iPad las notificaciones solo funcionan con Kibo en la pantalla de inicio.",
  },
};

export function PushSubscriptionCard() {
  const { state, error, busy, enable, disable } = usePushSubscription();
  const hint = state === "loading" ? null : HINTS[state];

  return (
    <div className="flex flex-col gap-2">
      <ListGroup title="Este dispositivo">
        <ListRow
          icon="🔔"
          title="Notificaciones push"
          subtitle={SUBTITLES[state]}
          trailing={
            state === "available" ? (
              <Button size="sm" onClick={enable} loading={busy}>
                Activar
              </Button>
            ) : state === "subscribed" ? (
              <Switch
                checked
                onChange={() => disable()}
                disabled={busy}
                label="Notificaciones en este dispositivo"
              />
            ) : null
          }
        />
        {state === "ios-not-installed" ? (
          <ListRow
            icon="📲"
            title="Instalar Kibo"
            subtitle="En iPhone las notificaciones requieren la app instalada"
            href="/settings/install"
          />
        ) : null}
      </ListGroup>

      {hint ? <Alert tone={hint.tone}>{hint.text}</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
