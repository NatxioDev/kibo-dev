"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { labelClassName } from "@/components/ui/Field";
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
      ? `Solo puedes cambiarlo una vez cada ${cooldownDays} ${cooldownDays === 1 ? "día" : "días"}.`
      : null;

  return (
    <Card as="section" className="flex flex-col gap-3 px-5 py-5">
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
            <p className="px-1 text-xs text-muted-foreground">{cooldownHint}</p>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className={labelClassName}>Nombre de usuario</span>
              <span className="truncate text-base font-semibold text-foreground">
                @{username}
              </span>
            </div>
            {nextChangeLabel ? null : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSaved(false);
                  setEditing(true);
                }}
              >
                Cambiar
              </Button>
            )}
          </div>
          {nextChangeLabel ? (
            <p className="text-xs text-muted-foreground">
              Podrás cambiarlo de nuevo el {nextChangeLabel}.
            </p>
          ) : null}
          {saved ? (
            <p className="text-sm text-income" role="status">
              ✓ Nombre de usuario actualizado.
            </p>
          ) : null}
        </>
      )}
    </Card>
  );
}
