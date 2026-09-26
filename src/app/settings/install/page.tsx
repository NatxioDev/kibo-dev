import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { InstallGuide } from "@/features/install/components/InstallGuide";

export default function InstallSettingsPage() {
  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Instalar app"
          description="Agrega Kibo a tu pantalla de inicio y úsala como una app más."
        />
      </Reveal>
      <Reveal>
        <InstallGuide />
      </Reveal>
    </PageShell>
  );
}
