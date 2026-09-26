"use client";

import { type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import {
  errorProps,
  Field,
  focusFirstError,
  textareaClassName,
} from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { useFeedbackForm } from "@/features/feedback/hooks/useFeedbackForm";
import type { FeedbackType } from "@/features/feedback/types";

const TYPE_OPTIONS: { value: FeedbackType; label: string }[] = [
  { value: "BUG", label: "🐞 Bug" },
  { value: "IDEA", label: "💡 Idea" },
  { value: "OTHER", label: "💬 Otro" },
];

const PLACEHOLDERS: Record<FeedbackType, string> = {
  BUG: "¿Qué pasó y qué esperabas que pasara?…",
  IDEA: "¿Qué te gustaría que Kibo hiciera?…",
  OTHER: "Cuéntanos lo que quieras…",
};

export function FeedbackForm() {
  const { values, updateField, fieldErrors, formError, success, loading, submit } =
    useFeedbackForm();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstError(submit(), ["type", "message"]);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-6">
      <Field label="Tipo" errorFor="type" error={fieldErrors.type}>
        <div id="type" tabIndex={-1} className="rounded-control">
          <Segmented
            label="Tipo de feedback"
            size="lg"
            value={values.type}
            disabled={loading}
            onChange={(value) => updateField("type", value)}
            options={TYPE_OPTIONS}
          />
        </div>
      </Field>

      <Field label="Mensaje" htmlFor="message" error={fieldErrors.message}>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={values.message}
          disabled={loading}
          onChange={(event) => updateField("message", event.target.value)}
          {...errorProps("message", fieldErrors.message)}
          className={textareaClassName}
          placeholder={PLACEHOLDERS[values.type]}
        />
      </Field>

      {formError ? <Alert>{formError}</Alert> : null}
      {success ? (
        <Alert tone="success">¡Gracias! Recibimos tu feedback.</Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "Enviando…" : "Enviar feedback"}
      </Button>
    </form>
  );
}
