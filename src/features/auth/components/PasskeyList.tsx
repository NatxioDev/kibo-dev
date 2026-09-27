"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, errorProps, inputClassName } from "@/components/ui/Field";
import { ListGroup, ListRow } from "@/components/ui/ListGroup";
import { DeletePasskeyDialog } from "@/features/auth/components/DeletePasskeyDialog";
import { RegisterPasskeyButton } from "@/features/auth/components/RegisterPasskeyButton";
import type { PasskeyCredential } from "@/features/auth/domain/Passkey";
import { usePasskeys } from "@/features/auth/hooks/usePasskeys";

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("es-BO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function passkeyLabel(passkey: PasskeyCredential, index: number) {
  return passkey.friendlyName ?? `Passkey ${index + 1}`;
}

export function PasskeyList() {
  const {
    passkeys,
    error,
    setError,
    loading,
    pending,
    register,
    rename,
    remove,
  } = usePasskeys();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PasskeyCredential | null>(
    null,
  );
  const [deleteIndex, setDeleteIndex] = useState(0);

  function startRename(passkey: PasskeyCredential, index: number) {
    setError(null);
    setEditingId(passkey.id);
    setDraftName(passkey.friendlyName ?? `Passkey ${index + 1}`);
  }

  function cancelRename() {
    setEditingId(null);
    setDraftName("");
  }

  function saveRename() {
    if (!editingId) return;
    rename(editingId, draftName, () => {
      setEditingId(null);
      setDraftName("");
    });
  }

  if (loading) {
    return (
      <p className="px-1 text-sm text-muted-foreground">Cargando Passkeys…</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {passkeys.length === 0 ? (
        <EmptyState
          icon="🔑"
          title="Sin Passkeys"
          description="Registra una Passkey en este dispositivo para entrar sin Google la próxima vez."
          action={
            <RegisterPasskeyButton
              onClick={() => register()}
              loading={pending}
            />
          }
        />
      ) : (
        <>
          <ListGroup
            title="Tus Passkeys"
            footer="Google sigue disponible como método de recuperación."
          >
            {passkeys.map((passkey, index) => {
              const label = passkeyLabel(passkey, index);
              const isEditing = editingId === passkey.id;

              if (isEditing) {
                return (
                  <li key={passkey.id} className="flex flex-col gap-3 px-4 py-4">
                    <Field label="Nombre" htmlFor={`passkey-name-${passkey.id}`}>
                      <input
                        id={`passkey-name-${passkey.id}`}
                        className={inputClassName}
                        value={draftName}
                        maxLength={120}
                        onChange={(event) => setDraftName(event.target.value)}
                        disabled={pending}
                        {...errorProps(`passkey-name-${passkey.id}`)}
                      />
                    </Field>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveRename}
                        disabled={pending || !draftName.trim()}
                      >
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={cancelRename}
                        disabled={pending}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </li>
                );
              }

              return (
                <ListRow
                  key={passkey.id}
                  icon="🔑"
                  title={label}
                  subtitle={`Creada ${formatDate(passkey.createdAt)}`}
                  chevron={false}
                  trailing={
                    <span className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startRename(passkey, index)}
                        disabled={pending}
                      >
                        Renombrar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-expense"
                        onClick={() => {
                          setError(null);
                          setDeleteTarget(passkey);
                          setDeleteIndex(index);
                        }}
                        disabled={pending}
                      >
                        Eliminar
                      </Button>
                    </span>
                  }
                />
              );
            })}
          </ListGroup>

          <RegisterPasskeyButton
            onClick={() => register()}
            loading={pending}
          />
        </>
      )}

      {error && !deleteTarget ? (
        <p className="text-center text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}

      <DeletePasskeyDialog
        open={Boolean(deleteTarget)}
        passkeyName={
          deleteTarget ? passkeyLabel(deleteTarget, deleteIndex) : ""
        }
        loading={pending}
        error={deleteTarget ? error : null}
        onConfirm={() => {
          if (!deleteTarget) return;
          remove(deleteTarget.id, () => setDeleteTarget(null));
        }}
        onClose={() => {
          if (pending) return;
          setError(null);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
