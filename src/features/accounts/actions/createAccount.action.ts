"use server";

import { revalidatePath } from "next/cache";
import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CreateAccount } from "@/features/accounts/application/CreateAccount.application";
import { accountFormSchema } from "@/features/accounts/schemas/accountSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { AccountFormValues } from "@/features/accounts/schemas/accountSchema";

export async function createAccountAction(
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
  const result = await new CreateAccount(accountRepository).execute(parsed.data);

  if (result.success) {
    revalidatePath("/");
    revalidatePath("/settings/accounts");
    revalidatePath("/transactions");
  }

  return result;
}
