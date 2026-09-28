"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getBalanceVisible,
  setBalanceVisible,
  subscribeBalanceVisible,
} from "@/features/dashboard/balanceVisibilityStore";

export function useBalanceVisibility() {
  const visible = useSyncExternalStore(
    subscribeBalanceVisible,
    getBalanceVisible,
    () => true,
  );

  const toggle = useCallback(() => {
    setBalanceVisible(!getBalanceVisible());
  }, []);

  const setVisible = useCallback((next: boolean) => {
    setBalanceVisible(next);
  }, []);

  return { visible, toggle, setVisible };
}
