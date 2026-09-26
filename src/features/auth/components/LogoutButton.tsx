"use client";

import { Button } from "@/components/ui/Button";
import { useLogout } from "@/features/auth/hooks/useLogout";

export function LogoutButton() {
  const { logout, error, loading } = useLogout();

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        variant="destructive"
        size="lg"
        onClick={logout}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Cerrando sesión…" : "Cerrar sesión"}
      </Button>
      {error ? (
        <p className="px-1 text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
