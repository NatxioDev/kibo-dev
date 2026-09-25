"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SetPaymentMethodActive } from "@/features/payment-methods/application/SetPaymentMethodActive.application";

export function useTogglePaymentMethodActive() {
  const router = useRouter();
  const { paymentMethodRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, isActive: boolean, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await new SetPaymentMethodActive(
        paymentMethodRepository,
      ).execute(id, isActive);

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
