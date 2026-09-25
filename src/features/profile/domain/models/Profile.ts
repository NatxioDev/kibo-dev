export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  username_changed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CurrentProfile = Profile & {
  email: string | null;
};

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
