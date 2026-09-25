"use client";

import { type FormEvent } from "react";
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-300 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <label
        htmlFor="display_name"
        className="text-sm font-medium text-zinc-600 dark:text-zinc-300"
      >
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
          className="h-12 min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <button
          type="submit"
          disabled={loading || !dirty}
          className="h-12 shrink-0 rounded-lg bg-zinc-900 px-4 text-base font-medium text-zinc-50 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {loading ? "Guardando…" : "Guardar"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-expense" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm text-income" role="status">
          Nombre actualizado.
        </p>
      ) : null}
    </form>
  );
}
