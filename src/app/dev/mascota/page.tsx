import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { KiboLoader } from "@/components/mascot/KiboLoader";
import { Button } from "@/components/ui/Button";
import { EyeMorphProbe } from "./EyeMorphProbe";

export const metadata: Metadata = {
  title: "Mascota · Dev · Kibo",
};

const SIZES = [48, 32, 24, 20];

const THEMES: { name: string; className: string; style?: CSSProperties }[] = [
  { name: "Tema actual", className: "" },
  {
    name: "Claro",
    className: "bg-[#f3ecd9] text-[#0b0b0f]",
    style: { "--mascot-ink": "#14120d" } as CSSProperties,
  },
  { name: "Oscuro", className: "dark bg-[#14120d] text-white" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function MascotaDevPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <PageShell width="lg">
      <PageHeader
        back={{ href: "/settings", label: "Ajustes" }}
        eyebrow="Dev"
        title="Mascota"
        description="Banco de pruebas de KIBO-84. No existe en producción."
      />

      <Section title="Prueba Safari: forma de ojos con motion">
        <div className="flex items-center gap-4 rounded-card bg-surface p-4">
          <EyeMorphProbe />
          <p className="text-sm text-muted-foreground">
            El ojo debería pasar de píldora a arco ^ y volver en cualquier
            navegador, incluido Safari.
          </p>
        </div>
      </Section>

      <Section title="Botones con loading">
        <div className="flex flex-wrap items-center gap-3 rounded-card bg-surface p-4">
          <Button size="sm" loading>
            Guardando…
          </Button>
          <Button loading>Guardando…</Button>
          <Button size="lg" variant="secondary" loading>
            Cargando reportes
          </Button>
          <Button variant="danger" loading>
            Eliminando…
          </Button>
        </div>
      </Section>

      {THEMES.map((theme) => (
        <Section key={theme.name} title={`Loader · ${theme.name}`}>
          <div
            className={`flex flex-col gap-6 rounded-card p-5 ${theme.className || "bg-surface"}`}
            style={theme.style}
          >
            <div className="flex items-center justify-center gap-10">
              <KiboLoader variant="screen" size={120} />
              <KiboLoader variant="compact" size={104} />
            </div>
            {(["screen", "compact"] as const).map((variant) => (
              <div key={variant} className="flex items-end gap-5">
                <span className="w-20 text-xs font-semibold uppercase opacity-60">
                  {variant === "screen" ? "Pantalla" : "Compacto"}
                </span>
                {SIZES.map((size) => (
                  <span key={size} className="flex flex-col items-center gap-1">
                    <KiboLoader variant={variant} size={size} />
                    <span className="text-[0.625rem] opacity-60">{size}px</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Section>
      ))}
    </PageShell>
  );
}
