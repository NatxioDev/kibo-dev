"use server";

import { createServerDependencies } from "@/core/infrastructure/factories/createServerDependencies";
import { CreateFeedback } from "@/features/feedback/application/CreateFeedback.application";
import { feedbackFormSchema } from "@/features/feedback/schemas/feedbackSchema";
import type { ServiceResult } from "@/features/transactions/domain/models";
import type { FeedbackType } from "@/features/feedback/types";

type FeedbackFormValues = {
  type: FeedbackType;
  message: string;
  page: string | null;
};

export async function createFeedbackAction(
  values: FeedbackFormValues,
): Promise<ServiceResult<{ id: string }>> {
  // Validación de entrada en el servidor
  const parsed = feedbackFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: "Los datos del feedback no son válidos.",
    };
  }

  // Obtener dependencias del servidor (incluye autenticación)
  const { feedbackRepository } = await createServerDependencies();

  // Ejecutar el caso de uso
  const result = await new CreateFeedback(feedbackRepository).execute(
    parsed.data,
  );

  return result;
}
