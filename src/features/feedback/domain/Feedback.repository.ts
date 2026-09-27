import type { FeedbackFormOutput } from "@/features/feedback/schemas/feedbackSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Feedback } from "@/features/feedback/types";

export interface FeedbackRepository {
  create(values: FeedbackFormOutput): Promise<ServiceResult<Feedback>>;
}
