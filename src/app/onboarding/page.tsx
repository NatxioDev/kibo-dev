import { redirect } from "next/navigation";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { GetCurrentProfile } from "@/features/profile/application/GetCurrentProfile.application";
import { ProfileAvatar } from "@/features/profile/components/ProfileAvatar";
import { OnboardingUsernameForm } from "@/features/profile/components/OnboardingUsernameForm";

export default async function OnboardingPage() {
  const { profileRepository } = await createServerDependencies();
  const result = await new GetCurrentProfile(profileRepository).execute();

  if (result.success && result.data.username) {
    redirect("/");
  }

  const profile = result.success ? result.data : null;
  const name = profile?.display_name ?? profile?.email ?? null;
  const firstName = name?.split(" ")[0];

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-stretch gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <ProfileAvatar
            avatarUrl={profile?.avatar_url ?? null}
            name={name}
            size={72}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {firstName ? `¡Hola, ${firstName}!` : "¡Bienvenido!"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Elige tu nombre de usuario. Tus amigos te encontrarán con él y
            podrás cambiarlo después desde Ajustes.
          </p>
        </div>

        <OnboardingUsernameForm />

        <div className="flex flex-col gap-2 text-center">
          {profile?.email ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sesión iniciada como {profile.email}
            </p>
          ) : null}
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
