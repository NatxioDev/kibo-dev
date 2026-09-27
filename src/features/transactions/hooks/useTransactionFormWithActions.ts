"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import type { ExpenseEditContext, SplitDraft } from "@/features/splits/domain/models";
import { resolveSplitDraft } from "@/features/splits/domain/resolveSplit";
import { fromCents, splitEqual, toCents } from "@/features/splits/domain/splitAmount";
import { listActiveCategoriesByTypeAction } from "@/features/transactions/actions/listActiveCategoriesByType.action";
import { listActivePaymentMethodsAction } from "@/features/transactions/actions/listActivePaymentMethods.action";
import { createTransactionAction } from "@/features/transactions/actions/createTransaction.action";
import {
  updateSharedExpenseAction,
  updateTransactionAction,
} from "@/features/transactions/actions/updateTransaction.action";
import { todayDateInputValue } from "@/features/transactions/components/formatters";
import type {
  Category,
  PaymentMethod,
  Transaction,
  TransactionCurrency,
  TransactionFormValues,
  TransactionType,
} from "@/features/transactions/domain/models";
import { transactionFormSchema } from "@/features/transactions/schemas/transactionSchema";

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

type SplitState = {
  enabled: boolean;
  payerConsumes: boolean;
  mode: "equal" | "custom";
  friendIds: string[];
  payerAmount: string;
  friendAmounts: Record<string, string>;
};

type FieldErrors = Partial<Record<keyof FormState | "split", string>>;

type UseTransactionFormOptions = {
  mode: "create" | "edit" | "edit-bill";
  transaction?: Transaction;
  friends?: FriendProfile[];
  bill?: ExpenseEditContext | null;
  shareLock?: { payerName: string } | null;
};

function toFormState(transaction?: Transaction, bill?: ExpenseEditContext | null): FormState {
  if (bill) {
    return {
      type: "EXPENSE",
      amount: String(bill.totalAmount),
      currency: bill.currency,
      date: bill.date,
      category_id: bill.categoryId ?? "",
      payment_method_id: bill.paymentMethodId ?? "",
      merchant: bill.merchant ?? "",
      description: bill.description ?? "",
    };
  }

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

function toSplitState(bill?: ExpenseEditContext | null): SplitState {
  if (!bill) {
    return {
      enabled: false,
      payerConsumes: true,
      mode: "equal",
      friendIds: [],
      payerAmount: "",
      friendAmounts: {},
    };
  }

  const friendIds = bill.participants.map((item) => item.userId);
  let mode: "equal" | "custom" = "custom";
  if (friendIds.length > 0) {
    const equal = splitEqual(bill.totalAmount, friendIds.length, bill.payerConsumes);
    const samePayer = toCents(fromCents(equal.payerCents)) === toCents(bill.payerAmount);
    const sameFriends = bill.participants.every(
      (item, index) => toCents(item.amount) === (equal.friendCents[index] ?? -1),
    );
    if (samePayer && sameFriends) mode = "equal";
  }

  return {
    enabled: true,
    payerConsumes: bill.payerConsumes,
    mode,
    friendIds,
    payerAmount: String(bill.payerAmount),
    friendAmounts: Object.fromEntries(
      bill.participants.map((item) => [item.userId, String(item.amount)]),
    ),
  };
}

export function useTransactionFormWithActions({
  mode,
  transaction,
  friends = [],
  bill = null,
  shareLock = null,
}: UseTransactionFormOptions) {
  const router = useRouter();
  const [values, setValues] = useState<FormState>(() => toFormState(transaction, bill));
  const [split, setSplit] = useState<SplitState>(() => toSplitState(bill));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Carga dinámica de opciones del formulario desde el cliente.
  // Se mantiene en el cliente porque las categorías cambian según el tipo de transacción
  // seleccionado, requiriendo re-fetch reactivo. Los métodos de pago se cargan
  // junto con las categorías para mantener el estado consistente.
  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      setOptionsError(null);

      const [categoriesResult, paymentMethodsResult] = await Promise.all([
        listActiveCategoriesByTypeAction(values.type),
        listActivePaymentMethodsAction(),
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
        return { ...prev, type: value as TransactionType, category_id: "" };
      }
      return { ...prev, [key]: value };
    });
    if (key === "type" && value !== "EXPENSE") {
      setSplit((prev) => ({ ...prev, enabled: false }));
    }
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
  }

  function updateSplit(patch: Partial<SplitState>) {
    setSplit((prev) => ({ ...prev, ...patch }));
    setFieldErrors((prev) => ({ ...prev, split: undefined }));
    setFormError(null);
  }

  function toggleFriend(id: string) {
    setSplit((prev) => {
      const friendIds = prev.friendIds.includes(id)
        ? prev.friendIds.filter((friendId) => friendId !== id)
        : [...prev.friendIds, id];
      return { ...prev, friendIds };
    });
    setFieldErrors((prev) => ({ ...prev, split: undefined }));
  }

  function setFriendAmount(id: string, amount: string) {
    setSplit((prev) => ({
      ...prev,
      friendAmounts: { ...prev.friendAmounts, [id]: amount },
    }));
    setFieldErrors((prev) => ({ ...prev, split: undefined }));
  }

  function submit(): FieldErrors | null {
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
      return nextErrors;
    }

    const payload: TransactionFormValues = parsed.data;
    const splitting = split.enabled && payload.type === "EXPENSE" && !shareLock;
    let draft: SplitDraft | null = null;

    if (splitting) {
      draft = {
        payerConsumes: split.payerConsumes,
        mode: split.mode,
        friendIds: split.friendIds,
        payerAmount: Number(split.payerAmount || 0),
        friendAmounts: split.friendIds.map((userId) => ({
          userId,
          amount: Number(split.friendAmounts[userId] || 0),
        })),
      };
      const resolved = resolveSplitDraft({
        totalAmount: payload.amount,
        currency: payload.currency,
        date: payload.date,
        merchant: payload.merchant,
        description: payload.description,
        categoryId: payload.category_id,
        paymentMethodId: payload.payment_method_id,
        draft,
      });
      if (!resolved.ok) {
        const nextErrors = { split: resolved.error };
        setFieldErrors(nextErrors);
        return nextErrors;
      }
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createTransactionAction(payload, draft)
          : mode === "edit-bill" && bill
            ? await updateSharedExpenseAction(bill.expenseId, payload, draft!)
            : await updateTransactionAction(transaction!.id, payload, draft);

      if (!result.success) {
        setFormError(result.error);
        return;
      }

      if (result.data.id) {
        router.push(mode === "create" ? "/" : `/transactions/${result.data.id}`);
      } else {
        router.push("/friends");
      }
      router.refresh();
    });
    return null;
  }

  return {
    values,
    updateField,
    split,
    updateSplit,
    toggleFriend,
    setFriendAmount,
    friends,
    fieldErrors,
    formError,
    categories,
    paymentMethods,
    loadingOptions,
    optionsError,
    loading: isPending,
    submit,
    amountLocked: Boolean(shareLock) || Boolean(bill?.amountsLocked),
    typeLocked: Boolean(shareLock) || Boolean(bill),
    shareLock,
    showSplit: values.type === "EXPENSE" && !shareLock,
    splitRequired: Boolean(bill),
  };
}
