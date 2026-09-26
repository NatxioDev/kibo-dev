import type { ReactNode } from "react";

export const inputClassName =
  "glass h-12 w-full rounded-2xl border border-border bg-surface px-4 text-base text-foreground shadow-card transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-primary/40 disabled:opacity-60 aria-invalid:border-expense/60";

export const textareaClassName =
  "glass w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-base text-foreground shadow-card transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-primary/40 disabled:opacity-60 aria-invalid:border-expense/60";

export const labelClassName =
  "text-[0.6875rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase";

type FieldProps = {
  label: ReactNode;
  htmlFor?: string;
  /** Id used for the error message when the control isn't a labelable element. */
  errorFor?: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Field({
  label,
  htmlFor,
  errorFor,
  error,
  hint,
  children,
  className = "",
}: FieldProps) {
  const Label = htmlFor ? "label" : "span";
  const errorBase = htmlFor ?? errorFor;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor={htmlFor} className={`px-1 ${labelClassName}`}>
        {label}
      </Label>
      {children}
      {error ? (
        <p
          id={errorBase ? `${errorBase}-error` : undefined}
          className="px-1 text-sm text-expense"
          aria-live="polite"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="px-1 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function focusFirstError(
  errors: Partial<Record<string, string>> | null,
  order: readonly string[],
) {
  if (!errors) return;
  const first = order.find((key) => errors[key]);
  if (first) document.getElementById(first)?.focus();
}

/** Props that wire an input to its `Field` error message. */
export function errorProps(id: string, error?: string) {
  return error
    ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` }
    : {};
}
