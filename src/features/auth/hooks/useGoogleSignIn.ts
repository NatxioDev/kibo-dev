"use client";

import { useEffect, useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SignInWithGoogle } from "@/features/auth/application/SignInWithGoogle.application";

export function useGoogleSignIn() {
  const { authRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) setRedirecting(false);
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  function signIn() {
    setError(null);

    startTransition(async () => {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const result = await new SignInWithGoogle(authRepository).execute(
        redirectTo,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setRedirecting(true);
    });
  }

  return { signIn, error, loading: isPending || redirecting, redirecting };
}
