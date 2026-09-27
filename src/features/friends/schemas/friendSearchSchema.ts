import { z } from "zod";
import { USERNAME_MAX_LENGTH } from "@/features/profile/schemas/usernameSchema";

export { sanitizeUsernameInput as sanitizeFriendSearchInput } from "@/features/profile/schemas/usernameSchema";

export const FRIEND_SEARCH_MIN_LENGTH = 2;
export const FRIEND_SEARCH_LIMIT = 10;

export const friendSearchSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(FRIEND_SEARCH_MIN_LENGTH)
  .max(USERNAME_MAX_LENGTH)
  .regex(/^[a-z0-9_]+$/);
