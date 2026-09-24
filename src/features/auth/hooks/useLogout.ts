"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut } from "@/features/auth/services/auth";

export function useLogout() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function logout() {
    setError(null);

    startTransition(async () => {
      const result = await signOut();

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
