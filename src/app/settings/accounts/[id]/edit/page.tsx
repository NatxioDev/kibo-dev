import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetAccount } from "@/features/accounts/application/GetAccount.application";
import { AccountForm } from "@/features/accounts/components/AccountForm";

type EditAccountPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = await params;
  const { accountRepository } = await createServerDependencies();
  const result = await new GetAccount(accountRepository).execute(id);

  if (!result.success) {
    notFound();
  }

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings/accounts", label: "Cuentas" }}
          title="Editar cuenta"
        />
      </Reveal>
      <Reveal>
        <AccountForm mode="edit" account={result.data} />
      </Reveal>
    </PageShell>
  );
}
