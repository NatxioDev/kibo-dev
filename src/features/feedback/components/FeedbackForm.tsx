"use client";

import { type FormEvent } from "react";
import { useFeedbackForm } from "@/features/feedback/hooks/useFeedbackForm";
import type { FeedbackType } from "@/features/feedback/types";

const labelClassName = "text-sm font-medium text-zinc-600 dark:text-zinc-300";

const TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: "BUG", label: "Bug" },
  { value: "IDEA", label: "Idea" },
  { value: "OTHER", label: "Otro" },
];

export function FeedbackForm() {
  const {
    values,
    updateField,
    fieldErrors,
    formError,
    success,
    loading,
    submit,
  } = useFeedbackForm();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className={labelClassName}>Tipo</span>
        <div className="grid grid-cols-3 gap-2">
          {TYPE_OPTIONS.map((option) => {
            const selected = values.type === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={loading}
                onClick={() => updateField("type", option.value)}
                className={`h-12 rounded-lg border text-sm font-medium ${
                  selected
                    ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {fieldErrors.type ? (
          <p className="text-sm text-expense">
            {fieldErrors.type}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={labelClassName}>
          Mensaje
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          disabled={loading}
          onChange={(event) => updateField("message", event.target.value)}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-base text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          placeholder="Cuéntanos qué pasó o qué te gustaría mejorar…"
        />
        {fieldErrors.message ? (
          <p className="text-sm text-expense">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p className="text-sm text-expense" role="alert">
          {formError}
        </p>
      ) : null}

      {success ? (
        <p className="text-sm text-income" role="status">
          Gracias, recibimos tu feedback.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-lg bg-zinc-900 text-base font-medium text-zinc-50 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {loading ? "Enviando…" : "Enviar feedback"}
      </button>
    </form>
  );
}
