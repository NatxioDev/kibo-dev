"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTransaction } from "@/features/transactions/services/transactions";

export function useDeleteTransaction() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(id: string, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await deleteTransaction(id);

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess?.();
      router.refresh();
    });
  }

  return { remove, error, loading: isPending, setError };
}
