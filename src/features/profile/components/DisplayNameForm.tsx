"use client";

import { type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { inputClassName, labelClassName } from "@/components/ui/Field";
import { useDisplayNameForm } from "@/features/profile/hooks/useDisplayNameForm";

type DisplayNameFormProps = {
  initialValue: string;
};

export function DisplayNameForm({ initialValue }: DisplayNameFormProps) {
  const { value, updateValue, error, success, dirty, loading, submit } =
    useDisplayNameForm(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <Card
      as="form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 px-5 py-5"
    >
      <label htmlFor="display_name" className={labelClassName}>
        Nombre visible
      </label>
      <div className="flex gap-2">
        <input
          id="display_name"
          name="display_name"
          type="text"
          autoComplete="name"
          maxLength={50}
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          disabled={loading}
          placeholder="Cómo quieres que te saludemos…"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "display_name-error" : undefined}
          className={`${inputClassName} min-w-0 flex-1 shadow-none`}
        />
        <Button type="submit" size="lg" disabled={loading || !dirty}>
          {loading ? "Guardando…" : "Guardar"}
        </Button>
      </div>
      {error ? (
        <p id="display_name-error" className="text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-income" role="status">
          ✓ Nombre actualizado.
        </p>
      ) : null}
    </Card>
  );
}
