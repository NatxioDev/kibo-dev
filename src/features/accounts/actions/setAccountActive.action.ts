"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { SetAccountActive } from "@/features/accounts/application/SetAccountActive.application";
import type { ServiceResult } from "@/core/domain/ServiceResult";

const setAccountActiveSchema = z.object({
  id: z.string().uuid("ID de cuenta inválido"),
  isActive: z.boolean(),
});

export async function setAccountActiveAction(
  id: string,
  isActive: boolean,
): Promise<ServiceResult<{ id: string }>> {
  const parsed = setAccountActiveSchema.safeParse({ id, isActive });
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos para activar/desactivar la cuenta no son válidos.",
    };
  }

  const { accountRepository } = await createServerDependencies();
  const result = await new SetAccountActive(accountRepository).execute(
    parsed.data.id,
    parsed.data.isActive,
  );

  if (result.success) {
    revalidatePath("/");
    revalidatePath("/settings/accounts");
    revalidatePath("/transactions");
  }

  return result;
}
