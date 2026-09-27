"use client";

import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { RegisterPasskey } from "@/features/auth/application/RegisterPasskey.application";

export function useRegisterPasskey() {
  const { authRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function register(friendlyName?: string, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await new RegisterPasskey(authRepository).execute(
        friendlyName,
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess?.();
    });
  }

  return { register, error, setError, loading: isPending };
}
