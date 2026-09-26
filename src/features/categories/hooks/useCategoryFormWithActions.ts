"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategoryAction } from "@/features/categories/actions/createCategory.action";
import { updateCategoryAction } from "@/features/categories/actions/updateCategory.action";
import { categoryFormSchema } from "@/features/categories/schemas/categorySchema";
import type { Category, TransactionType } from "@/features/transactions/domain/models";

type FormState = {
  name: string;
  icon: string;
  type: TransactionType;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type UseCategoryFormOptions = {
  mode: "create" | "edit";
  category?: Category;
};

function toFormState(category?: Category): FormState {
  if (!category) {
    return { name: "", icon: "", type: "EXPENSE" };
  }

  return {
    name: category.name,
    icon: category.icon ?? "",
    type: category.type,
  };
}

export function useCategoryFormWithActions({ mode, category }: UseCategoryFormOptions) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() => toFormState(category));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  }

  function submit(): FieldErrors | null {
    setFormError(null);
    setFieldErrors({});

    const parsed = categoryFormSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !(key in nextErrors)) {
          nextErrors[key as keyof FormState] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return nextErrors;
    }

    startTransition(async () => {
      const payload = {
        name: parsed.data.name,
        icon: parsed.data.icon ?? "",
        type: parsed.data.type,
      };
      const result =
        mode === "create"
          ? await createCategoryAction(payload)
          : await updateCategoryAction(category!.id, payload);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push("/settings/categories");
      router.refresh();
    });
    return null;
  }

  return {
    values,
    updateField,
    fieldErrors,
    formError,
    loading: isPending,
    submit,
  };
}
