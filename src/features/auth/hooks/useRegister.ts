"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signUp } from "@/features/auth/services/auth";
import type { RegisterCredentials } from "@/types/auth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useRegister() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function register(credentials: RegisterCredentials) {
    setError(null);
    setSuccessMessage(null);

    const email = credentials.email.trim();
    const { password, confirmPassword } = credentials;

    if (!email) {
      setError("El email es obligatorio.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Introduce un email válido.");
      return;
    }

    if (!password) {
      setError("La contraseña es obligatoria.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      const result = await signUp({ email, password });

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        setSuccessMessage(
          "Cuenta creada. Revisa tu email para confirmar el registro.",
        );
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return { register, error, successMessage, loading: isPending };
}
