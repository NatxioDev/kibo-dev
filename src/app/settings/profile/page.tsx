import { PageHeader } from "@/components/PageHeader";
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
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <PageHeader
          breadcrumbs={[
            { href: "/", label: "Inicio" },
            { href: "/settings", label: "Perfil" },
          ]}
          fallbackHref="/settings"
          title="Editar perfil"
        />

        {profile ? (
          <>
            <ProfileHeader profile={profile} />
            {profile.username ? (
              <UsernameSettings
                username={profile.username}
                nextChangeLabel={nextChangeLabel}
                cooldownDays={cooldownDays}
              />
            ) : null}
            <DisplayNameForm initialValue={profile.display_name ?? ""} />
          </>
        ) : (
          <p className="text-sm text-expense" role="alert">
            {result.success ? null : result.error}
          </p>
        )}
      </div>
    </main>
  );
}
