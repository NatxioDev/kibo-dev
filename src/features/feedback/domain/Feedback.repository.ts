import type { FeedbackFormOutput } from "@/features/feedback/schemas/feedbackSchema";
import type { Feedback, ServiceResult } from "@/features/feedback/types";

export interface FeedbackRepository {
  create(values: FeedbackFormOutput): Promise<ServiceResult<Feedback>>;
}
