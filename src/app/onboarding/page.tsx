import { redirect } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { Card } from "@/components/ui/Card";
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
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <Stagger
        stagger={0.12}
        className="flex w-full max-w-sm flex-col items-stretch gap-6"
      >
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <ProfileAvatar
            avatarUrl={profile?.avatar_url ?? null}
            name={name}
            size={88}
            className="ring-4 ring-border shadow-card"
          />
          <h1 className="font-display text-5xl font-extrabold tracking-[-0.05em] text-balance text-foreground">
            {firstName ? `¡Hola, ${firstName}!` : "¡Bienvenido!"}
          </h1>
        </Reveal>

        <Reveal spring="bouncy">
          <Card className="glass-lens flex flex-col gap-5 px-6 py-7">
            <p className="text-sm text-pretty text-muted-foreground">
              Elige tu nombre de usuario. Tus amigos te encontrarán con él y
              podrás cambiarlo después desde Ajustes.
            </p>
            <OnboardingUsernameForm />
          </Card>
        </Reveal>

        <Reveal className="flex flex-col gap-3 text-center">
          {profile?.email ? (
            <p className="text-xs text-muted-foreground">
              Sesión iniciada como {profile.email}
            </p>
          ) : null}
          <LogoutButton />
        </Reveal>
      </Stagger>
    </main>
  );
}
