"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  getSeenVersion,
  setSeenVersion,
  subscribeSeenVersion,
} from "@/features/changelog/seenVersionStore";
import { getUnseenReleases } from "@/features/changelog/utils/releases";
import { APP_VERSION } from "@/lib/version";

/**
 * Hook del cliente para rastrear cambios no vistos en el changelog.
 * Se mantiene completamente en el cliente porque:
 * - Usa localStorage para persistir la última versión vista por el usuario
 * - El estado de "visto" es específico del navegador/dispositivo
 * - No requiere sincronización con el servidor
 */
export function useWhatsNew() {
  // `undefined` mientras no hidrata; `null` si el usuario nunca abrió Kibo en este navegador.
  const lastSeen = useSyncExternalStore<string | null | undefined>(
    subscribeSeenVersion,
    getSeenVersion,
    () => undefined,
  );
  const isFirstVisit = lastSeen === null;

  useEffect(() => {
    if (isFirstVisit) setSeenVersion(APP_VERSION);
  }, [isFirstVisit]);

  const unseen = useMemo(() => (lastSeen ? getUnseenReleases(lastSeen) : []), [lastSeen]);

  const markSeen = useCallback(() => {
    if (getSeenVersion() !== APP_VERSION) setSeenVersion(APP_VERSION);
  }, []);

  return { unseen, hasUnseen: unseen.length > 0, isFirstVisit, markSeen };
}
