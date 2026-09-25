import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { APP_NAME, APP_VERSION } from "@/lib/version";

export default async function SettingsPage() {
  const { profileRepository } = await createServerDependencies();
  const result = await new GetCurrentProfile(profileRepository).execute();
  const profile = result.success ? result.data : null;

  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[{ href: "/", label: "Inicio" }]}
          fallbackHref="/"
          title="Ajustes"
        />

        {profile ? (
          <ProfileHeader profile={profile} href="/settings/profile" />
        ) : (
          <p className="text-sm text-expense" role="alert">
            {result.success ? null : result.error}
          </p>
        )}


        <section className="flex items-center justify-between gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-base font-medium text-zinc-900 dark:text-zinc-50">
            Apariencia
          </p>
          <ThemeToggle />
        </section>

        <nav className="flex flex-col gap-3">
          <Link
            href="/settings/categories"
            className="flex h-14 items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 text-base font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            Categorías
            <span className="text-zinc-500 dark:text-zinc-400">→</span>
          </Link>
          <Link
            href="/settings/payment-methods"
            className="flex h-14 items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 text-base font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            Métodos de pago
            <span className="text-zinc-500 dark:text-zinc-400">→</span>
          </Link>
          <Link
            href="/settings/feedback"
            className="flex h-14 items-center justify-between rounded-xl border border-zinc-300 bg-white px-4 text-base font-medium text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            Enviar feedback
            <span className="text-zinc-500 dark:text-zinc-400">→</span>
          </Link>
          <LogoutButton />
        </nav>

        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          {APP_NAME} v{APP_VERSION}
        </p>
      </div>
    </main>
  );
}
