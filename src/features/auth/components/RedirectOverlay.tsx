"use client";

import { motion } from "motion/react";
import { KiboLoader } from "@/components/mascot/KiboLoader";
import { Portal } from "@/components/ui/Portal";

export function RedirectOverlay({ label }: { label: string }) {
  return (
    <Portal>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <KiboLoader variant="screen" size={88} label={null} />
        <p role="status" className="text-base font-semibold text-foreground">
          {label}
        </p>
      </motion.div>
    </Portal>
  );
}
