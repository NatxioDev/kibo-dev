"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { FriendProfile } from "@/features/friends/domain/models/Friendship";
import type { ExpenseEditContext, SplitDraft } from "@/features/splits/domain/models";
import { resolveSplitDraft } from "@/features/splits/domain/resolveSplit";
import { fromCents, splitEqual, toCents } from "@/features/splits/domain/splitAmount";
import { getAccountAction } from "@/features/transactions/actions/getAccount.action";
import { listActiveAccountsAction } from "@/features/transactions/actions/listActiveAccounts.action";
import { listActiveCategoriesByTypeAction } from "@/features/transactions/actions/listActiveCategoriesByType.action";
import { listActivePaymentMethodsAction } from "@/features/transactions/actions/listActivePaymentMethods.action";
import { createTransactionAction } from "@/features/transactions/actions/createTransaction.action";
import {
  updateSharedExpenseAction,
  updateTransactionAction,
} from "@/features/transactions/actions/updateTransaction.action";
import { todayDateInputValue } from "@/features/transactions/components/formatters";
import type {
  Account,
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
  account_id: string;
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
  preset?: "debt";
};

function toFormState(transaction?: Transaction, bill?: ExpenseEditContext | null): FormState {
  if (bill) {
    return {
      type: "EXPENSE",
      amount: String(bill.totalAmount),
      currency: bill.currency,
      date: bill.date,
      account_id: "",
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
      account_id: "",
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
    account_id: transaction.account_id ?? "",
    category_id: transaction.category_id ?? "",
    payment_method_id: transaction.payment_method_id ?? "",
    merchant: transaction.merchant ?? "",
    description: transaction.description ?? "",
  };
}

function toSplitState(bill?: ExpenseEditContext | null, preset?: "debt"): SplitState {
  if (!bill) {
    const debt = preset === "debt";
    return {
      enabled: debt,
      payerConsumes: !debt,
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
  preset,
}: UseTransactionFormOptions) {
  const router = useRouter();
  const isDebt = preset === "debt";
  const [values, setValues] = useState<FormState>(() => toFormState(transaction, bill));
  const [split, setSplit] = useState<SplitState>(() => toSplitState(bill, preset));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Sin cuentas creadas no bloqueamos el registro; el servidor aplica la misma regla.
  const requiresAccount = mode === "create" && accounts.length > 0;

  // Carga dinámica de opciones del formulario desde el cliente.
  // Se mantiene en el cliente porque las categorías cambian según el tipo de transacción
  // seleccionado, requiriendo re-fetch reactivo. Cuentas y métodos de pago se cargan
  // junto con las categorías para mantener el estado consistente.
  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      setOptionsError(null);

      const [categoriesResult, paymentMethodsResult, accountsResult] =
        await Promise.all([
          listActiveCategoriesByTypeAction(values.type),
          listActivePaymentMethodsAction(),
          listActiveAccountsAction(),
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

      if (!accountsResult.success) {
        setOptionsError(accountsResult.error);
        setLoadingOptions(false);
        return;
      }

      setCategories(categoriesResult.data);
      setPaymentMethods(paymentMethodsResult.data);

      let nextAccounts = accountsResult.data;
      const currentAccountId = transaction?.account_id;
      if (
        currentAccountId &&
        !nextAccounts.some((account) => account.id === currentAccountId)
      ) {
        const current = await getAccountAction(currentAccountId);
        if (!cancelled && current.success) {
          nextAccounts = [current.data, ...nextAccounts];
        }
      }

      if (cancelled) return;

      setAccounts(nextAccounts);
      setValues((prev) => {
        if (prev.account_id) return prev;
        if (mode !== "create" || accountsResult.data.length === 0) return prev;
        const first = accountsResult.data[0];
        return { ...prev, account_id: first.id, currency: first.currency };
      });
      setLoadingOptions(false);
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [mode, transaction?.account_id, values.type]);

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

  function selectAccount(accountId: string) {
    const account = accounts.find((item) => item.id === accountId);
    setValues((prev) => ({
      ...prev,
      account_id: accountId,
      currency:
        mode === "create" && account && !shareLock ? account.currency : prev.currency,
    }));
    setFieldErrors((prev) => ({ ...prev, account_id: undefined, currency: undefined }));
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

    if (requiresAccount && !parsed.data.account_id) {
      const nextErrors = { account_id: "Selecciona una cuenta." };
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

      if (result.data.id && !isDebt) {
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
    selectAccount,
    split,
    updateSplit,
    toggleFriend,
    setFriendAmount,
    friends,
    fieldErrors,
    formError,
    accounts,
    categories,
    paymentMethods,
    loadingOptions,
    optionsError,
    loading: isPending,
    submit,
    requiresAccount,
    amountLocked: Boolean(shareLock) || Boolean(bill?.amountsLocked),
    typeLocked: Boolean(shareLock) || Boolean(bill) || isDebt,
    shareLock,
    showSplit: values.type === "EXPENSE" && !shareLock,
    splitRequired: Boolean(bill) || isDebt,
    isDebt,
  };
}
