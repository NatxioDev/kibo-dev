"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { CreateFeedback } from "@/features/feedback/application/CreateFeedback.application";
import { feedbackFormSchema } from "@/features/feedback/schemas/feedbackSchema";
import type { FeedbackType } from "@/features/feedback/types";

type FormState = {
  type: FeedbackType;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function useFeedbackForm() {
  const pathname = usePathname();
  const { feedbackRepository } = useDependencyContext();
  const [values, setValues] = useState<FormState>({
    type: "IDEA",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
    setSuccess(false);
  }

  function submit() {
    setFormError(null);
    setFieldErrors({});
    setSuccess(false);

    const parsed = feedbackFormSchema.safeParse({
      ...values,
      page: pathname || null,
    });

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in nextErrors)) {
          nextErrors[key as keyof FormState] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    startTransition(async () => {
      const result = await new CreateFeedback(feedbackRepository).execute(
        parsed.data,
      );

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      setValues({ type: "IDEA", message: "" });
      setSuccess(true);
    });
  }

  return {
    values,
    updateField,
    fieldErrors,
    formError,
    success,
    loading: isPending,
    submit,
  };
}
