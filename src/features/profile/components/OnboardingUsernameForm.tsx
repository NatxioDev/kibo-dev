"use client";

import { useRouter } from "next/navigation";
import { setUsernameAction } from "@/features/profile/actions/setUsername.action";
import { UsernameForm } from "@/features/profile/components/UsernameForm";

export function OnboardingUsernameForm() {
  const router = useRouter();

  return (
    <UsernameForm
      submitLabel="Continuar"
      onSubmit={(username) => setUsernameAction(username)}
      onSuccess={() => {
        router.replace("/");
        router.refresh();
      }}
    />
  );
}
