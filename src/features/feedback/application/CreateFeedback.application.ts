import type { FeedbackRepository } from "@/features/feedback/domain/Feedback.repository";
import type { FeedbackFormOutput } from "@/features/feedback/schemas/feedbackSchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type { Feedback } from "@/features/feedback/types";

export class CreateFeedback {
  constructor(private readonly feedbackRepository: FeedbackRepository) {}

  execute(values: FeedbackFormOutput): Promise<ServiceResult<Feedback>> {
    return this.feedbackRepository.create(values);
  }
}
