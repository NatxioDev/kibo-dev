export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthResult =
  | { success: true; needsEmailConfirmation?: boolean }
  | { success: false; error: string };
