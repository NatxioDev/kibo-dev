import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { AccountForm } from "@/features/accounts/components/AccountForm";

export default function NewAccountPage() {
  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings/accounts", label: "Cuentas" }}
          title="Nueva cuenta"
        />
      </Reveal>
      <Reveal>
        <AccountForm mode="create" />
      </Reveal>
    </PageShell>
  );
}
