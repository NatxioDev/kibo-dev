"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createAccountAction } from "@/features/accounts/actions/createAccount.action";
import { updateAccountAction } from "@/features/accounts/actions/updateAccount.action";
import { accountFormSchema } from "@/features/accounts/schemas/accountSchema";
import type { AccountFormValues } from "@/features/accounts/schemas/accountSchema";
import type { Account } from "@/features/transactions/domain/models";

type FormState = {
  name: string;
  type: AccountFormValues["type"];
  currency: AccountFormValues["currency"];
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type UseAccountFormOptions = {
  mode: "create" | "edit";
  account?: Account;
};

function toFormState(account?: Account): FormState {
  if (!account) {
    return { name: "", type: "SAVINGS", currency: "BOB" };
  }

  return {
    name: account.name,
    type: account.type,
    currency: account.currency,
  };
}

export function useAccountFormWithActions({
  mode,
  account,
}: UseAccountFormOptions) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() => toFormState(account));
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

    const parsed = accountFormSchema.safeParse(values);

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
      const result =
        mode === "create"
          ? await createAccountAction(parsed.data)
          : await updateAccountAction(account!.id, parsed.data);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push("/settings/accounts");
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
