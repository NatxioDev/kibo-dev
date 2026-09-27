"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CountPendingFriendRequests } from "@/features/friends/application/CountPendingFriendRequests.application";
import {
  ClassifyShare,
  ConfirmSettlement,
  DisputeShare,
  RecordReceivedPayment,
  RejectSettlement,
  RequestSettlement,
  WithdrawShareDispute,
} from "@/features/splits/application/SplitCommands.application";
import { VoidSharedExpense } from "@/features/splits/application/VoidSharedExpense.application";
import type { FriendAlertCounts, ServiceResult } from "@/features/splits/domain/models";
import {
  settlementAmountSchema,
  shareIdSchema,
} from "@/features/splits/schemas/splitSchema";

function revalidateMoneyPaths() {
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/friends", "layout");
}

export async function countFriendAlertsAction(): Promise<ServiceResult<FriendAlertCounts>> {
  const { friendshipRepository, splitRepository } = await createServerDependencies();
  const [requests, attention] = await Promise.all([
    new CountPendingFriendRequests(friendshipRepository).execute(),
    splitRepository.countAttention(),
  ]);

  if (!requests.success) return requests;
  if (!attention.success) return attention;

  return {
    success: true,
    data: {
      requests: requests.data,
      unclassified: attention.data.unclassified,
      disputes: attention.data.disputes,
    },
  };
}

export async function classifyShareAction(
  shareId: string,
  categoryId: string,
): Promise<ServiceResult<{ transactionId: string }>> {
  const parsed = shareIdSchema.safeParse({ shareId, categoryId });
  if (!parsed.success || !parsed.data.categoryId) {
    return { success: false, error: "Elige una de tus categorías." };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new ClassifyShare(splitRepository).execute(
    parsed.data.shareId,
    parsed.data.categoryId,
  );
  if (result.success) revalidateMoneyPaths();
  return result;
}

export async function disputeShareAction(shareId: string): Promise<ServiceResult<null>> {
  const parsed = z.string().uuid().safeParse(shareId);
  if (!parsed.success) {
    return { success: false, error: "No encontramos esa parte del gasto." };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new DisputeShare(splitRepository).execute(parsed.data);
  if (result.success) revalidateMoneyPaths();
  return result;
}

export async function withdrawDisputeAction(
  shareId: string,
): Promise<ServiceResult<null>> {
  const parsed = z.string().uuid().safeParse(shareId);
  if (!parsed.success) {
    return { success: false, error: "No encontramos esa parte del gasto." };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new WithdrawShareDispute(splitRepository).execute(parsed.data);
  if (result.success) revalidateMoneyPaths();
  return result;
}

export async function requestSettlementAction(input: {
  userId: string;
  amount: number;
  currency: "BOB" | "USD";
}): Promise<ServiceResult<{ id: string }>> {
  const parsed = settlementAmountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "El pago no es válido.",
    };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new RequestSettlement(splitRepository).execute({
    creditorId: parsed.data.userId,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
  });
  if (result.success) revalidateMoneyPaths();
  return result;
}

export async function confirmSettlementAction(
  settlementId: string,
): Promise<ServiceResult<null>> {
  const parsed = z.string().uuid().safeParse(settlementId);
  if (!parsed.success) {
    return { success: false, error: "No hay un pago pendiente para confirmar." };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new ConfirmSettlement(splitRepository).execute(parsed.data);
  if (result.success) revalidateMoneyPaths();
  return result;
}

export async function rejectSettlementAction(
  settlementId: string,
): Promise<ServiceResult<null>> {
  const parsed = z.string().uuid().safeParse(settlementId);
  if (!parsed.success) {
    return { success: false, error: "No hay un pago pendiente para rechazar." };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new RejectSettlement(splitRepository).execute(parsed.data);
  if (result.success) revalidateMoneyPaths();
  return result;
}

export async function recordReceivedPaymentAction(input: {
  userId: string;
  amount: number;
  currency: "BOB" | "USD";
}): Promise<ServiceResult<{ id: string }>> {
  const parsed = settlementAmountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "El pago no es válido.",
    };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new RecordReceivedPayment(splitRepository).execute({
    debtorId: parsed.data.userId,
    amount: parsed.data.amount,
    currency: parsed.data.currency,
  });
  if (result.success) revalidateMoneyPaths();
  return result;
}

export async function voidSharedExpenseAction(
  expenseId: string,
): Promise<ServiceResult<null>> {
  const parsed = z.string().uuid().safeParse(expenseId);
  if (!parsed.success) {
    return { success: false, error: "No encontramos ese gasto compartido." };
  }

  const { splitRepository } = await createServerDependencies();
  const result = await new VoidSharedExpense(splitRepository).execute(parsed.data);
  if (result.success) revalidateMoneyPaths();
  return result;
}
