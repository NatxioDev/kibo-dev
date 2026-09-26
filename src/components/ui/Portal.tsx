"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

const subscribe = () => () => {};

/**
 * Glass surfaces use backdrop-filter, which turns them into the containing
 * block of `position: fixed` descendants, so overlays must escape to <body>.
 */
export function Portal({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return isClient ? createPortal(children, document.body) : null;
}
