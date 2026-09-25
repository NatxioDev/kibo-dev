"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { SetCategoryActive } from "@/features/categories/application/SetCategoryActive.application";

export function useToggleCategoryActive() {
  const router = useRouter();
  const { categoryRepository } = useDependencyContext();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, isActive: boolean, onSuccess?: () => void) {
    setError(null);

    startTransition(async () => {
      const result = await new SetCategoryActive(categoryRepository).execute(
        id,
        isActive,
      );

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
