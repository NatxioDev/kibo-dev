"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MascotMood } from "@/components/mascot/types";

export type WelcomeActivity = "idle" | "busy" | "error";

type WelcomeMascotContextValue = {
  mood: MascotMood;
  report: (id: string, activity: WelcomeActivity | null) => void;
};

const WelcomeMascotContext = createContext<WelcomeMascotContextValue | null>(null);

function moodFor(activities: WelcomeActivity[]): MascotMood {
  if (activities.includes("busy")) return "pensando";
  if (activities.includes("error")) return "mareado";
  return "guino";
}

/** La mascota del logo refleja lo que hacen los controles de la escena (p. ej. el login). */
export function WelcomeMascotProvider({
  children,
  initialMood = "guino",
}: {
  children: ReactNode;
  /** Mood antes de que los controles reporten su estado (p. ej. un error que llega en la URL). */
  initialMood?: MascotMood;
}) {
  const [activities, setActivities] = useState<Record<string, WelcomeActivity>>({});

  const report = useCallback((id: string, activity: WelcomeActivity | null) => {
    setActivities((prev) => {
      if (activity === null) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return prev[id] === activity ? prev : { ...prev, [id]: activity };
    });
  }, []);

  const reported = Object.values(activities);
  const mood = reported.length > 0 ? moodFor(reported) : initialMood;
  const value = useMemo(() => ({ mood, report }), [mood, report]);

  return <WelcomeMascotContext value={value}>{children}</WelcomeMascotContext>;
}

export function useWelcomeMascotMood(): MascotMood {
  return useContext(WelcomeMascotContext)?.mood ?? "guino";
}

export function useReportWelcomeActivity(activity: WelcomeActivity) {
  const report = useContext(WelcomeMascotContext)?.report;
  const id = useId();

  useEffect(() => {
    report?.(id, activity);
  }, [report, id, activity]);

  useEffect(() => () => report?.(id, null), [report, id]);
}
