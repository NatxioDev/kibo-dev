"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { changeUsernameAction } from "@/features/profile/actions/changeUsername.action";
import { UsernameForm } from "@/features/profile/components/UsernameForm";

type UsernameSettingsProps = {
  username: string;
  nextChangeLabel: string | null;
  cooldownDays: number;
};

export function UsernameSettings({
  username,
  nextChangeLabel,
  cooldownDays,
}: UsernameSettingsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const cooldownHint =
    cooldownDays > 0
      ? `Puedes cambiarlo una vez cada ${cooldownDays} ${cooldownDays === 1 ? "día" : "días"}.`
      : null;

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900">
      {editing ? (
        <>
          <UsernameForm
            key={username}
            currentUsername={username}
            submitLabel="Guardar"
            onSubmit={changeUsernameAction}
            onSuccess={() => {
              setEditing(false);
              setSaved(true);
              router.refresh();
            }}
            onCancel={() => setEditing(false)}
          />
          {cooldownHint ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {cooldownHint}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                Nombre de usuario
              </span>
              <span className="truncate text-base text-zinc-900 dark:text-zinc-50">
                @{username}
              </span>
            </div>
            {nextChangeLabel ? null : (
              <button
                type="button"
                onClick={() => {
                  setSaved(false);
                  setEditing(true);
                }}
                className="h-10 shrink-0 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                Cambiar
              </button>
            )}
          </div>
          {nextChangeLabel ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Podrás cambiarlo de nuevo el {nextChangeLabel}.
            </p>
          ) : null}
          {saved ? (
            <p className="text-sm text-income" role="status">
              Nombre de usuario actualizado.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
