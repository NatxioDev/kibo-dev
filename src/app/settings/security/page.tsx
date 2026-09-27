import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { PasskeyList } from "@/features/auth/components/PasskeyList";

export default function SecuritySettingsPage() {
  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Seguridad"
          description="Registra Passkeys para iniciar sesión sin contraseña. Google sigue disponible como respaldo."
        />
      </Reveal>
      <Reveal>
        <PasskeyList />
      </Reveal>
    </PageShell>
  );
}
