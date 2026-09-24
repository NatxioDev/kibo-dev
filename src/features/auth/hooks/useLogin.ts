"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signIn } from "@/features/auth/services/auth";
import type { LoginCredentials } from "@/types/auth";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function login(credentials: LoginCredentials) {
    setError(null);

    const email = credentials.email.trim();
    const password = credentials.password;

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

    startTransition(async () => {
      const result = await signIn({ email, password });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return { login, error, loading: isPending };
}
