"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { DeletePasskey } from "@/features/auth/application/DeletePasskey.application";
import { ListPasskeys } from "@/features/auth/application/ListPasskeys.application";
import { RegisterPasskey } from "@/features/auth/application/RegisterPasskey.application";
import { UpdatePasskey } from "@/features/auth/application/UpdatePasskey.application";
import type { PasskeyCredential } from "@/features/auth/domain/Passkey";

export function usePasskeys() {
  const { authRepository } = useDependencyContext();
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const result = await new ListPasskeys(authRepository).execute();
    if (!result.success) {
      setError(result.error);
      setPasskeys([]);
      return;
    }
    setError(null);
    setPasskeys(result.data);
  }, [authRepository]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const result = await new ListPasskeys(authRepository).execute();
      if (cancelled) return;
      if (!result.success) {
        setError(result.error);
        setPasskeys([]);
      } else {
        setError(null);
        setPasskeys(result.data);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authRepository]);

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
      await refresh();
      onSuccess?.();
    });
  }

  function rename(
    id: string,
    friendlyName: string,
    onSuccess?: () => void,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await new UpdatePasskey(authRepository).execute(
        id,
        friendlyName,
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      await refresh();
      onSuccess?.();
    });
  }

  function remove(id: string, onSuccess?: () => void) {
    setError(null);
    startTransition(async () => {
      const result = await new DeletePasskey(authRepository).execute(id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      await refresh();
      onSuccess?.();
    });
  }

  return {
    passkeys,
    error,
    setError,
    loading,
    pending: isPending,
    register,
    rename,
    remove,
    refresh,
  };
}
