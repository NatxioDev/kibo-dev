import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { ListGroup, ListRow } from "@/components/ui/ListGroup";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { UnseenDot } from "@/features/changelog/components/UnseenDot";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ThemeToggle } from "@/features/theme/ThemeToggle";
import { APP_NAME, APP_STAGE, APP_VERSION } from "@/lib/version";

export default async function SettingsPage() {
  const { profileRepository } = await createServerDependencies();
  const result = await new GetCurrentProfile(profileRepository).execute();
  const profile = result.success ? result.data : null;

  return (
    <PageShell>
      <Reveal>
        <PageHeader back={{ href: "/", label: "Inicio" }} title="Ajustes" />
      </Reveal>

      <Reveal>
        {profile ? (
          <ProfileHeader profile={profile} href="/settings/profile" />
        ) : (
          <Alert>{result.success ? "No se pudo cargar tu perfil." : result.error}</Alert>
        )}
      </Reveal>

      <Reveal>
        <ListGroup title="Preferencias">
          <ListRow icon="🌙" title="Modo oscuro" trailing={<ThemeToggle />} />
          <ListRow
            icon="📲"
            title="Instalar app"
            subtitle="Tenla en tu pantalla de inicio"
            href="/settings/install"
          />
          <ListRow
            icon="🔐"
            title="Seguridad"
            subtitle="Passkeys para entrar sin contraseña"
            href="/settings/security"
          />
        </ListGroup>
      </Reveal>

      <Reveal>
        <ListGroup title="Finanzas">
          <ListRow
            icon="🏦"
            title="Cuentas"
            subtitle="Ahorros, efectivo, bancos…"
            href="/settings/accounts"
          />
          <ListRow
            icon="🏷️"
            title="Categorías"
            subtitle="Organiza tus gastos e ingresos"
            href="/settings/categories"
          />
          <ListRow
            icon="💳"
            title="Métodos de pago"
            subtitle="Tarjetas, efectivo, QR…"
            href="/settings/payment-methods"
          />
        </ListGroup>
      </Reveal>

      <Reveal>
        <ListGroup title="Soporte">
          <ListRow
            icon="✨"
            title="Novedades"
            subtitle={`v${APP_VERSION}`}
            trailing={<UnseenDot />}
            href="/settings/novedades"
          />
          <ListRow icon="💬" title="Enviar feedback" href="/settings/feedback" />
          <ListRow icon="🔒" title="Privacidad" href="/privacy" />
        </ListGroup>
      </Reveal>

      <Reveal className="flex flex-col gap-4">
        <LogoutButton />
        <Link
          href="/settings/novedades"
          className="mx-auto text-center text-xs text-muted-foreground tabular-nums transition-colors hover:text-foreground"
        >
          {APP_NAME} {APP_STAGE} v{APP_VERSION}
        </Link>
      </Reveal>
    </PageShell>
  );
}
