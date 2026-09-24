"use client";

import { useLogout } from "@/features/auth/hooks/useLogout";

export function LogoutButton() {
  const { logout, error, loading } = useLogout();

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className="h-12 w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-base font-medium text-zinc-800 dark:text-zinc-100 disabled:opacity-60"
      >
        {loading ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
