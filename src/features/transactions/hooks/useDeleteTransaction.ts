"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { DeleteTransaction } from "@/features/transactions/application/DeleteTransaction.application";

export function useDeleteTransaction() {
  const router = useRouter();
  const { transactionRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(id: string, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await new DeleteTransaction(transactionRepository).execute(
        id,
      );

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
