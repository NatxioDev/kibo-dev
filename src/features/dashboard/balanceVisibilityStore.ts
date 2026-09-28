export const BALANCE_VISIBILITY_STORAGE_KEY = "kibo-balance-visible";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key === BALANCE_VISIBILITY_STORAGE_KEY || event.key === null) {
    emit();
  }
}

/** Visible by default when no preference is stored. */
export function getBalanceVisible(): boolean {
  try {
    const stored = window.localStorage.getItem(BALANCE_VISIBILITY_STORAGE_KEY);
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true;
  }
}

export function setBalanceVisible(visible: boolean) {
  try {
    window.localStorage.setItem(
      BALANCE_VISIBILITY_STORAGE_KEY,
      visible ? "true" : "false",
    );
  } catch {
    // Sin acceso a localStorage (modo privado estricto): no se persiste.
  }
  emit();
}

export function subscribeBalanceVisible(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", handleStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", handleStorage);
    }
  };
}
