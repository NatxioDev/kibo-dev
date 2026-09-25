"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useDependencyContext } from "@/core/context/dependency/useDependencyContext";
import { CreatePaymentMethod } from "@/features/payment-methods/application/CreatePaymentMethod.application";
import { UpdatePaymentMethod } from "@/features/payment-methods/application/UpdatePaymentMethod.application";
import { paymentMethodFormSchema } from "@/features/payment-methods/schemas/paymentMethodSchema";
import type { PaymentMethod } from "@/features/transactions/domain/models";

type FormState = {
  name: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type UsePaymentMethodFormOptions = {
  mode: "create" | "edit";
  paymentMethod?: PaymentMethod;
};

function toFormState(paymentMethod?: PaymentMethod): FormState {
  if (!paymentMethod) {
    return { name: "" };
  }

  return { name: paymentMethod.name };
}

export function usePaymentMethodForm({
  mode,
  paymentMethod,
}: UsePaymentMethodFormOptions) {
  const router = useRouter();
  const { paymentMethodRepository } = useDependencyContext();
  const [values, setValues] = useState<FormState>(() =>
    toFormState(paymentMethod),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  }

  function submit() {
    setFormError(null);
    setFieldErrors({});

    const parsed = paymentMethodFormSchema.safeParse(values);

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
      const result =
        mode === "create"
          ? await new CreatePaymentMethod(paymentMethodRepository).execute(
              parsed.data,
            )
          : await new UpdatePaymentMethod(paymentMethodRepository).execute(
              paymentMethod!.id,
              parsed.data,
            );

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push("/settings/payment-methods");
      router.refresh();
    });
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
