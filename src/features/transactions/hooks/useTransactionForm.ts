"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { todayDateInputValue } from "@/features/transactions/components/formatters";
import { transactionFormSchema } from "@/features/transactions/schemas/transactionSchema";
import { listActiveCategoriesByType } from "@/features/transactions/services/categories";
import { listActivePaymentMethods } from "@/features/transactions/services/paymentMethods";
import {
  createTransaction,
  updateTransaction,
} from "@/features/transactions/services/transactions";
import type {
  Category,
  PaymentMethod,
  Transaction,
  TransactionCurrency,
  TransactionFormValues,
  TransactionType,
} from "@/features/transactions/types";

type FormState = {
  type: TransactionType;
  amount: string;
  currency: TransactionCurrency;
  date: string;
  category_id: string;
  payment_method_id: string;
  merchant: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

type UseTransactionFormOptions = {
  mode: "create" | "edit";
  transaction?: Transaction;
};

function toFormState(transaction?: Transaction): FormState {
  if (!transaction) {
    return {
      type: "EXPENSE",
      amount: "",
      currency: "BOB",
      date: todayDateInputValue(),
      category_id: "",
      payment_method_id: "",
      merchant: "",
      description: "",
    };
  }

  return {
    type: transaction.type,
    amount: String(transaction.amount),
    currency: transaction.currency,
    date: transaction.date,
    category_id: transaction.category_id ?? "",
    payment_method_id: transaction.payment_method_id ?? "",
    merchant: transaction.merchant ?? "",
    description: transaction.description ?? "",
  };
}

export function useTransactionForm({
  mode,
  transaction,
}: UseTransactionFormOptions) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() =>
    toFormState(transaction),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      setOptionsError(null);

      const [categoriesResult, paymentMethodsResult] = await Promise.all([
        listActiveCategoriesByType(values.type),
        listActivePaymentMethods(),
      ]);

      if (cancelled) return;

      if (!categoriesResult.success) {
        setOptionsError(categoriesResult.error);
        setLoadingOptions(false);
        return;
      }

      if (!paymentMethodsResult.success) {
        setOptionsError(paymentMethodsResult.error);
        setLoadingOptions(false);
        return;
      }

      setCategories(categoriesResult.data);
      setPaymentMethods(paymentMethodsResult.data);
      setLoadingOptions(false);
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [values.type]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((prev) => {
      if (key === "type" && value !== prev.type) {
        return {
          ...prev,
          type: value as TransactionType,
          category_id: "",
        };
      }
      return { ...prev, [key]: value };
    });
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  }

  function submit() {
    setFormError(null);
    setFieldErrors({});

    const parsed = transactionFormSchema.safeParse(values);

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

    const payload: TransactionFormValues = parsed.data;

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createTransaction(payload)
          : await updateTransaction(transaction!.id, payload);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return {
    values,
    updateField,
    fieldErrors,
    formError,
    categories,
    paymentMethods,
    loadingOptions,
    optionsError,
    loading: isPending,
    submit,
  };
}
