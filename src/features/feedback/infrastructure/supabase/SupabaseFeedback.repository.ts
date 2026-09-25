import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedbackRepository } from "@/features/feedback/domain/Feedback.repository";
import { mapFeedbackError } from "@/features/feedback/infrastructure/supabase/mapFeedbackError";
import type { FeedbackFormOutput } from "@/features/feedback/schemas/feedbackSchema";
import type { Feedback, ServiceResult } from "@/features/feedback/types";

export class SupabaseFeedbackRepository implements FeedbackRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(
    values: FeedbackFormOutput,
  ): Promise<ServiceResult<Feedback>> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Debes iniciar sesión para enviar feedback.",
      };
    }

    const { data, error } = await this.supabase
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
}
