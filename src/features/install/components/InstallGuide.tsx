"use client";

import { useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Segmented } from "@/components/ui/Segmented";
import { useInstallState } from "@/features/install/hooks/useInstallState";
import { promptInstall } from "@/features/install/installPromptStore";
import type { InstallPlatform } from "@/features/install/platform";

type Guide = {
  title: string;
  browser: string;
  steps: ReactNode[];
  note?: ReactNode;
};

const iconClass = "inline h-4 w-4 -translate-y-px align-middle";

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden>
    <path d="M12 3v12" />
    <path d="M8 7l4-4 4 4" />
    <path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const PlusSquareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

const DotsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
);

const InstallIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass} aria-hidden>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M12 8v6M9 11l3 3 3-3M8 21h8" />
  </svg>
);

const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
);

const GUIDES: Record<InstallPlatform, Guide[]> = {
  ios: [
    {
      title: "iPhone y iPad",
      browser: "Safari",
      steps: [
        <>Abre Kibo en <Strong>Safari</Strong>.</>,
        <>Toca el botón <Strong>Compartir</Strong> <ShareIcon /> en la barra inferior (o superior en iPad).</>,
        <>Desliza y elige <Strong>Agregar a inicio</Strong> <PlusSquareIcon />.</>,
        <>Asegúrate de que <Strong>Abrir como app web</Strong> esté activado y toca <Strong>Agregar</Strong>.</>,
        <>Abre Kibo desde el ícono en tu pantalla de inicio.</>,
      ],
      note: (
        <>
          Desde iOS 16.4 también puedes hacerlo en Chrome o Edge: toca <ShareIcon /> en la barra
          de direcciones y luego <Strong>Agregar a inicio</Strong>.
        </>
      ),
    },
  ],
  android: [
    {
      title: "Android",
      browser: "Chrome",
      steps: [
        <>Abre Kibo en <Strong>Chrome</Strong>.</>,
        <>Toca el menú <DotsIcon /> en la esquina superior derecha.</>,
        <>Elige <Strong>Instalar app</Strong> (o <Strong>Agregar a pantalla principal</Strong>).</>,
        <>Confirma tocando <Strong>Instalar</Strong>.</>,
        <>Encontrarás Kibo en tu cajón de apps y pantalla de inicio.</>,
      ],
      note: (
        <>
          En Samsung Internet, abre el menú <Strong>☰</Strong> y toca{" "}
          <Strong>Agregar página a</Strong> → <Strong>Pantalla de inicio</Strong>.
        </>
      ),
    },
  ],
  desktop: [
    {
      title: "Chrome y Edge",
      browser: "Windows, macOS, Linux",
      steps: [
        <>Abre Kibo en <Strong>Chrome</Strong> o <Strong>Edge</Strong>.</>,
        <>Haz clic en el ícono de instalar <InstallIcon /> al final de la barra de direcciones.</>,
        <>Si no lo ves, abre el menú <DotsIcon /> y elige <Strong>Transmitir, guardar y compartir</Strong> → <Strong>Instalar página como app</Strong> (en Edge: <Strong>Aplicaciones</Strong> → <Strong>Instalar este sitio como aplicación</Strong>).</>,
        <>Confirma con <Strong>Instalar</Strong>. Kibo se abrirá en su propia ventana.</>,
      ],
    },
    {
      title: "Safari en Mac",
      browser: "macOS Sonoma o superior",
      steps: [
        <>Abre Kibo en <Strong>Safari</Strong>.</>,
        <>En la barra de menús, elige <Strong>Archivo</Strong> → <Strong>Agregar al Dock</Strong> (o toca <ShareIcon /> → <Strong>Agregar al Dock</Strong>).</>,
        <>Confirma con <Strong>Agregar</Strong>. Kibo quedará en tu Dock y en Launchpad.</>,
      ],
    },
  ],
};

const PLATFORM_OPTIONS: { value: InstallPlatform; label: string }[] = [
  { value: "ios", label: "iPhone" },
  { value: "android", label: "Android" },
  { value: "desktop", label: "Computadora" },
];

const PLATFORM_NAMES: Record<InstallPlatform, string> = {
  ios: "un iPhone o iPad",
  android: "un Android",
  desktop: "una computadora",
};

export function InstallGuide() {
  const { platform, inAppBrowser, standalone, canPrompt } = useInstallState();
  const [selected, setSelected] = useState<InstallPlatform | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const active = selected ?? platform ?? "ios";

  async function handleInstall() {
    const outcome = await promptInstall();
    if (outcome === "dismissed") setDismissed(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {standalone ? (
        <Alert tone="success">¡Listo! Ya estás usando Kibo como app instalada. 🎉</Alert>
      ) : null}

      {!standalone && inAppBrowser ? (
        <Alert tone="info">
          Parece que abriste Kibo dentro de otra app. Para instalarla, ábrela en{" "}
          {platform === "ios" ? "Safari" : "tu navegador"} desde el menú de esta app.
        </Alert>
      ) : null}

      {!standalone && canPrompt ? (
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <p className="text-[0.9375rem] font-semibold text-foreground">Instalación en un toque</p>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              Tu navegador permite instalar Kibo directamente.
            </p>
          </div>
          <Button size="lg" onClick={handleInstall}>
            Instalar Kibo
          </Button>
          {dismissed ? (
            <p className="text-sm text-muted-foreground">
              Sin problema, puedes instalarla cuando quieras siguiendo los pasos de abajo.
            </p>
          ) : null}
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <Segmented
          label="Dispositivo"
          value={active}
          options={PLATFORM_OPTIONS}
          onChange={setSelected}
        />
        {platform ? (
          <p className="px-1 text-sm text-muted-foreground">
            Detectamos que estás en {PLATFORM_NAMES[platform]}.
          </p>
        ) : null}
      </section>

      {GUIDES[active].map((guide) => (
        <Card key={guide.title} as="section" className="flex flex-col gap-4 p-5">
          <header>
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
              {guide.title}
            </h2>
            <p className="text-sm text-muted-foreground">{guide.browser}</p>
          </header>
          <ol className="flex flex-col gap-3">
            {guide.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span
                  aria-hidden
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground tabular-nums"
                >
                  {index + 1}
                </span>
                <p className="pt-0.5 text-[0.9375rem] text-pretty text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
          {guide.note ? (
            <p className="rounded-2xl bg-surface-muted px-4 py-3 text-sm text-pretty text-muted-foreground">
              {guide.note}
            </p>
          ) : null}
        </Card>
      ))}

      <p className="px-1 text-sm text-pretty text-muted-foreground">
        Al instalarla, Kibo se abre a pantalla completa, sin barra del navegador, y la tienes a
        un toque desde tu pantalla de inicio.
      </p>
    </div>
  );
}
