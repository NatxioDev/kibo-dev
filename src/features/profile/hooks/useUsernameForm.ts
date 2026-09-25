"use client";

import { useEffect, useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { CheckUsernameAvailability } from "@/features/profile/application/CheckUsernameAvailability.application";
import type { ServiceResult } from "@/features/profile/domain/models/Profile";
import {
  sanitizeUsernameInput,
  usernameSchema,
} from "@/features/profile/schemas/usernameSchema";

const AVAILABILITY_DEBOUNCE_MS = 400;

export type UsernameStatus =
  | "idle"
  | "invalid"
  | "unchanged"
  | "checking"
  | "available"
  | "taken";

type Availability = {
  username: string;
  available: boolean;
};

export type UseUsernameFormOptions = {
  currentUsername?: string | null;
  onSubmit: (username: string) => Promise<ServiceResult<unknown>>;
  onSuccess: () => void;
};

export function useUsernameForm({
  currentUsername = null,
  onSubmit,
  onSuccess,
}: UseUsernameFormOptions) {
  const { profileRepository } = useDependencyContext();
  const [value, setValue] = useState(currentUsername ?? "");
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = usernameSchema.safeParse(value);
  const validationError =
    value && !parsed.success ? parsed.error.issues[0]?.message ?? null : null;
  const isUnchanged =
    parsed.success && parsed.data === currentUsername?.toLowerCase();
  const candidate = parsed.success && !isUnchanged ? parsed.data : null;

  useEffect(() => {
    if (!candidate) return;

    let cancelled = false;
    const timeout = setTimeout(async () => {
      const result = await new CheckUsernameAvailability(
        profileRepository,
      ).execute(candidate);

      if (!cancelled && result.success) {
        setAvailability({ username: candidate, available: result.data });
      }
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [candidate, profileRepository]);

  let status: UsernameStatus = "idle";
  if (validationError) {
    status = "invalid";
  } else if (isUnchanged) {
    status = "unchanged";
  } else if (candidate) {
    status =
      availability?.username === candidate
        ? availability.available
          ? "available"
          : "taken"
        : "checking";
  }

  function updateValue(next: string) {
    setValue(sanitizeUsernameInput(next));
    setFormError(null);
  }

  function submit() {
    setFormError(null);

    if (!candidate) {
      setFormError(validationError ?? "Elige un nombre de usuario.");
      return;
    }

    if (status === "taken") {
      setFormError("Ese nombre de usuario ya existe.");
      return;
    }

    startTransition(async () => {
      const result = await onSubmit(candidate);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      onSuccess();
    });
  }

  return {
    value,
    updateValue,
    status,
    validationError,
    formError,
    loading: isPending,
    submit,
  };
}
