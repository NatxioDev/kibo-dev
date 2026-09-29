"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { UpdateAccount } from "@/features/accounts/application/UpdateAccount.application";
import { accountFormSchema } from "@/features/accounts/schemas/accountSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { AccountFormValues } from "@/features/accounts/schemas/accountSchema";

export async function updateAccountAction(
  id: string,
  values: AccountFormValues,
): Promise<ServiceResult<{ id: string }>> {
  const parsed = accountFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos de la cuenta no son válidos.",
    };
  }

  const { accountRepository } = await createServerDependencies();
  const result = await new UpdateAccount(accountRepository).execute(
    id,
    parsed.data,
  );

  if (result.success) {
    revalidatePath("/");
    revalidatePath("/settings/accounts");
    revalidatePath(`/settings/accounts/${id}`);
    revalidatePath("/transactions");
  }

  return result;
}
