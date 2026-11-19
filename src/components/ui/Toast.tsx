"use client";

import { useEffect, useState } from "react";
import { Portal } from "@/components/ui/Portal";

export type ToastAction = {
  label: string;
  onClick: () => void | Promise<void>;
};

type ToastItem = {
  id: number;
  message: string;
  action?: ToastAction;
};

let nextId = 0;
let publish: ((toast: ToastItem) => void) | null = null;

export function showToast(message: string, action?: ToastAction) {
  publish?.({ id: ++nextId, message, action });
}

export function Toaster() {
  const [toast, setToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    publish = (item) => setToast(item);
    return () => {
      publish = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(
      () => {
        setToast((current) => (current?.id === toast.id ? null : current));
      },
      toast.action ? 7000 : 4000,
    );
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <Portal>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[70] flex justify-center px-4"
      >
        {toast ? (
          <div className="pointer-events-auto flex min-h-11 max-w-md items-center gap-2 rounded-card bg-[#14120d] px-4 py-1 text-sm font-semibold text-[#fbf1da] shadow-card">
            <span className="min-w-0 flex-1 text-pretty">{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                className="inline-flex min-h-11 shrink-0 items-center px-2 font-semibold text-[#e0a93b]"
                onClick={() => {
                  const action = toast.action;
                  setToast(null);
                  void action?.onClick();
                }}
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Portal>
  );
}
