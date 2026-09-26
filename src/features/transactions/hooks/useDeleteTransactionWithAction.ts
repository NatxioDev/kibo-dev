"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTransactionAction } from "@/features/transactions/actions/deleteTransaction.action";

export function useDeleteTransactionWithAction() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(id: string, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await deleteTransactionAction(id);

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
