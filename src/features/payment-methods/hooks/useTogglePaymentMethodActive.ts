"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setPaymentMethodActive } from "@/features/payment-methods/services/paymentMethods";

export function useTogglePaymentMethodActive() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, isActive: boolean, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await setPaymentMethodActive(id, isActive);

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
