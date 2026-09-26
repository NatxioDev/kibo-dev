"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateDisplayNameAction } from "@/features/profile/actions/updateDisplayName.action";
import { displayNameSchema } from "@/features/profile/schemas/displayNameSchema";

export function useDisplayNameFormWithAction(initialValue: string) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateValue(next: string) {
    setValue(next);
    setError(null);
    setSuccess(false);
  }

  function submit() {
    setError(null);
    setSuccess(false);

    const parsed = displayNameSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa el nombre.");
      return;
    }

    startTransition(async () => {
      const result = await updateDisplayNameAction(parsed.data);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setValue(result.data.display_name ?? parsed.data);
      setSuccess(true);
      router.refresh();
    });
  }

  return {
    value,
    updateValue,
    error,
    success,
    dirty: value.trim() !== initialValue.trim(),
    loading: isPending,
    submit,
  };
}
