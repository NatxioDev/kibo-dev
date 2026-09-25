"use client";

import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SignInWithGoogle } from "@/features/auth/application/SignInWithGoogle.application";

export function useGoogleSignIn() {
  const { authRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function signIn() {
    setError(null);

    startTransition(async () => {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const result = await new SignInWithGoogle(authRepository).execute(
        redirectTo,
      );

      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return { signIn, error, loading: isPending };
}
