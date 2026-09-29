"use client";

import { AnimatePresence, motion } from "motion/react";

export function AuthErrorMessage({ message }: { message: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          key={message}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="overflow-hidden"
        >
          <p className="pt-3 text-center text-sm text-expense" role="alert">
            {message}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
