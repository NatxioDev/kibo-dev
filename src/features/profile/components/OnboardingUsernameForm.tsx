"use client";

import { useRouter } from "next/navigation";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SetUsername } from "@/features/profile/application/SetUsername.application";
import { UsernameForm } from "@/features/profile/components/UsernameForm";

export function OnboardingUsernameForm() {
  const router = useRouter();
  const { profileRepository } = useDependencyContext();

  return (
    <UsernameForm
      submitLabel="Continuar"
      onSubmit={(username) =>
        new SetUsername(profileRepository).execute(username)
      }
      onSuccess={() => {
        router.replace("/");
        router.refresh();
      }}
    />
  );
}
