import { createClient } from "@/lib/supabase/client";
import type { FeedbackFormOutput } from "@/features/feedback/schemas/feedbackSchema";
import type { Feedback, ServiceResult } from "@/features/feedback/types";
import { mapFeedbackError } from "./mapFeedbackError";

export async function createFeedback(
  values: FeedbackFormOutput,
): Promise<ServiceResult<Feedback>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para enviar feedback.",
    };
  }

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      user_id: user.id,
      type: values.type,
      message: values.message,
      page: values.page,
    })
    .select("*")
    .single();

  if (error) {
    return { success: false, error: mapFeedbackError(error) };
  }

  return { success: true, data: data as Feedback };
}
