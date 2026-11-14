import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";
import { DisplayNameForm } from "@/features/profile/components/DisplayNameForm";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { UsernameSettings } from "@/features/profile/components/UsernameSettings";
import { getUsernameChangeCooldownDays } from "@/features/profile/config/usernameChange.config";
import {
  formatNextUsernameChange,
  getUsernameChangeAvailability,
} from "@/features/profile/domain/usernameChangePolicy";

export default async function ProfileSettingsPage() {
  const { profileRepository } = await createServerDependencies();
  const result = await new GetCurrentProfile(profileRepository).execute();
  const profile = result.success ? result.data : null;

  const cooldownDays = getUsernameChangeCooldownDays();
  const usernameAvailability = getUsernameChangeAvailability(
    profile?.username_changed_at ?? null,
    cooldownDays,
  );
  const nextChangeLabel = usernameAvailability.canChange
    ? null
    : formatNextUsernameChange(usernameAvailability.nextChangeAt);

  return (
    <PageShell>
      <Reveal>
        <PageHeader back={{ href: "/settings", label: "Ajustes" }} title="Perfil" />
      </Reveal>

      {profile ? (
        <>
          <Reveal>
            <ProfileHeader profile={profile} />
          </Reveal>
          {profile.username ? (
            <Reveal>
              <UsernameSettings
                username={profile.username}
                nextChangeLabel={nextChangeLabel}
                cooldownDays={cooldownDays}
              />
            </Reveal>
          ) : null}
          <Reveal>
            <DisplayNameForm initialValue={profile.display_name ?? ""} />
          </Reveal>
          <Reveal>
            <Card className="px-5 py-4">
              <Link href="/settings/qr" className="flex flex-col gap-1">
                <span className="font-semibold text-foreground">QR de cobro</span>
                <span className="text-sm text-pretty text-muted-foreground">
                  La imagen que te dio tu banco, para quienes te deben.
                </span>
              </Link>
            </Card>
          </Reveal>
        </>
      ) : (
        <Reveal>
          <Alert>{result.success ? "No se pudo cargar tu perfil." : result.error}</Alert>
        </Reveal>
      )}
    </PageShell>
  );
}
