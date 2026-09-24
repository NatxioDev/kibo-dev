export type FeedbackType = "BUG" | "IDEA" | "OTHER";

export type Feedback = {
  id: string;
  user_id: string;
  type: FeedbackType;
  message: string;
  page: string | null;
  created_at: string;
};

export type FeedbackFormValues = {
  type: FeedbackType;
  message: string;
  page: string | null;
};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
