"use client";

import { useEffect } from "react";
import { startInstallPromptCapture } from "@/features/install/installPromptStore";

export function InstallPromptListener() {
  useEffect(() => {
    startInstallPromptCapture();
  }, []);

  return null;
}
