"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setAccountActiveAction } from "@/features/accounts/actions/setAccountActive.action";

export function useToggleAccountActiveWithAction() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, isActive: boolean, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await setAccountActiveAction(id, isActive);

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess?.();
      router.refresh();
    });
  }

  return { toggle, error, loading: isPending, setError };
}
