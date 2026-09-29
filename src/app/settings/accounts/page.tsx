import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { ListAccounts } from "@/features/accounts/application/ListAccounts.application";
import { AccountList } from "@/features/accounts/components/AccountList";

export default async function AccountsSettingsPage() {
  const { accountRepository } = await createServerDependencies();
  const result = await new ListAccounts(accountRepository).execute();

  return (
    <PageShell>
      <Reveal>
        <PageHeader
          back={{ href: "/settings", label: "Ajustes" }}
          title="Cuentas"
          actions={
            <Button href="/settings/accounts/new" size="sm">
              + Nueva
            </Button>
          }
        />
      </Reveal>

      {!result.success ? (
        <Reveal>
          <Alert>{result.error}</Alert>
        </Reveal>
      ) : (
        <AccountList accounts={result.data} />
      )}
    </PageShell>
  );
}
