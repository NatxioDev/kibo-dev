"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SignInWithPasskey } from "@/features/auth/application/SignInWithPasskey.application";

export function usePasskeySignIn() {
  const router = useRouter();
  const { authRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function signIn() {
    setError(null);

    startTransition(async () => {
      const result = await new SignInWithPasskey(authRepository).execute();

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return { signIn, error, loading: isPending };
}
