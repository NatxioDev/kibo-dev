"use client";

import { useRef, type ChangeEvent, type InputHTMLAttributes } from "react";
import { Money, type Currency } from "@/core/domain/value-objects";

type AmountInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type" | "inputMode"
> & {
  /** Canonical amount string ("1234.5"). */
  value: string;
  currency: Currency;
  onValueChange: (canonical: string) => void;
};

function caretPosition(
  display: string,
  digitsBefore: number,
  afterSeparator: boolean,
  decimalSeparator: string,
): number {
  let position = 0;
  let digits = 0;
  while (position < display.length && digits < digitsBefore) {
    if (/\d/.test(display[position])) digits += 1;
    position += 1;
  }
  if (afterSeparator && display[position] === decimalSeparator) position += 1;
  return position;
}

export function AmountInput({
  value,
  currency,
  onValueChange,
  placeholder,
  ...props
}: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const beforeCaret = raw.slice(0, event.target.selectionStart ?? raw.length);
    const digitsBefore = beforeCaret.replace(/\D/g, "").length;
    const afterSeparator = /[.,]$/.test(beforeCaret);
    const pasted =
      (event.nativeEvent as InputEvent).inputType === "insertFromPaste";

    onValueChange(Money.sanitizeInput(raw, currency, { pasted }));

    // Grouping separators shift characters, so restore the caret after React
    // commits the formatted value.
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input || document.activeElement !== input) return;
      const position = caretPosition(
        input.value,
        digitsBefore,
        afterSeparator,
        currency.decimalSeparator,
      );
      input.setSelectionRange(position, position);
    });
  }

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="decimal"
      placeholder={placeholder ?? currency.inputPlaceholder}
      value={Money.toInputDisplay(value, currency)}
      onChange={handleChange}
    />
  );
}
