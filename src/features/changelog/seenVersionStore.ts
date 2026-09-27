export const SEEN_VERSION_STORAGE_KEY = "kibo-last-seen-version";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key === SEEN_VERSION_STORAGE_KEY || event.key === null) emit();
}

export function getSeenVersion(): string | null {
  try {
    return window.localStorage.getItem(SEEN_VERSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSeenVersion(version: string) {
  try {
    window.localStorage.setItem(SEEN_VERSION_STORAGE_KEY, version);
  } catch {
    // Sin acceso a localStorage (modo privado estricto): no se persiste.
  }
  emit();
}

export function subscribeSeenVersion(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", handleStorage);
  };
}
