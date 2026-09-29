"use client";

import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { WELCOME_EMOJIS } from "@/features/welcome/content/features";
import { FloatingEmoji } from "./FloatingEmoji";

const PARALLAX_SPRING = { stiffness: 60, damping: 20, mass: 0.6 };
const DESKTOP_QUERY = "(min-width: 64rem)";

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** `null` on the server: the field is purely client-side decoration. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => null,
  );
}

export function FloatingEmojiField() {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const [activeId, setActiveId] = useState<string | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, PARALLAX_SPRING);
  const pointerY = useSpring(rawY, PARALLAX_SPRING);

  useEffect(() => {
    if (reduceMotion || !isDesktop) return;
    const finePointer = window.matchMedia("(pointer: fine)");
    if (!finePointer.matches) return;

    const onPointerMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      rawX.set(0);
      rawY.set(0);
    };
  }, [reduceMotion, isDesktop, rawX, rawY]);

  if (isDesktop === null) return null;

  const items = isDesktop
    ? WELCOME_EMOJIS
    : WELCOME_EMOJIS.filter((item) => item.mobile);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {items.map((item, index) => (
        <FloatingEmoji
          key={item.id}
          item={item}
          index={index}
          layout={isDesktop ? "desktop" : "mobile"}
          open={activeId === item.id}
          onOpenChange={(open) =>
            setActiveId((current) =>
              open ? item.id : current === item.id ? null : current,
            )
          }
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}
    </div>
  );
}
