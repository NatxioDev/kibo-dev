"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SignOut } from "@/features/auth/application/SignOut.application";
import { disableDevicePush } from "@/features/notifications/push/devicePush";

export function useLogout() {
  const router = useRouter();
  const { authRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function logout() {
    setError(null);

    startTransition(async () => {
      // Un dispositivo compartido no debe seguir recibiendo pushes de esta cuenta.
      await disableDevicePush().catch(() => {});

      const result = await new SignOut(authRepository).execute();

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/login");
      router.refresh();
    });
  }

  return { logout, error, loading: isPending };
}
