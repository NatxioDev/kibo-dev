import {
  EYE_BLINK,
  EYE_HAPPY,
  EYE_HAPPY_SQUEEZE,
  EYE_PILL,
  EYE_SLEEP,
  EYE_SMALL,
  EYE_SQUASH,
} from "./shapes";
import type { MascotMood } from "./types";

type CubicBezier = [number, number, number, number];
type Ease = "linear" | CubicBezier;

const IN_OUT: CubicBezier = [0.45, 0, 0.55, 1];
const OUT: CubicBezier = [0.2, 0.8, 0.2, 1];
const IN: CubicBezier = [0.55, 0, 0.75, 0.2];
const BACK: CubicBezier = [0.34, 1.56, 0.64, 1];

/** `[tiempo 0–1, forma, easing hasta el siguiente cuadro]`, igual que las keyframes de la demo. */
type Frame = readonly [time: number, d: string, ease?: Ease];

export type EyeTrack = {
  values: string[];
  times: number[];
  ease: Ease[];
  duration: number;
};

export type EyeConfig = {
  /** Forma quieta del estado: es la que se ve con reduced motion. */
  pose: string;
  track?: EyeTrack;
};

export type MoodConfig = {
  left: EyeConfig;
  right: EyeConfig;
};

function track(duration: number, frames: Frame[]): EyeTrack {
  return {
    duration,
    values: frames.map(([, d]) => d),
    times: frames.map(([time]) => time),
    ease: frames.slice(0, -1).map(([, , ease]) => ease ?? "linear"),
  };
}

function bothEyes(eye: EyeConfig): MoodConfig {
  return { left: eye, right: eye };
}

const IDLE_BLINK = track(6, [
  [0, EYE_PILL],
  [0.16, EYE_PILL, IN],
  [0.175, EYE_BLINK, OUT],
  [0.195, EYE_PILL],
  [0.6, EYE_PILL, IN],
  [0.613, EYE_BLINK, OUT],
  [0.628, EYE_PILL],
  [0.64, EYE_PILL, IN],
  [0.653, EYE_BLINK, OUT],
  [0.668, EYE_PILL],
  [1, EYE_PILL],
]);

const FELIZ_EYE = track(3, [
  [0, EYE_PILL],
  [0.08, EYE_PILL, IN],
  [0.12, EYE_SQUASH, BACK],
  [0.18, EYE_HAPPY],
  [0.44, EYE_HAPPY, OUT],
  [0.49, EYE_HAPPY_SQUEEZE, BACK],
  [0.56, EYE_HAPPY],
  [0.8, EYE_HAPPY, OUT],
  [0.85, EYE_HAPPY_SQUEEZE, BACK],
  [0.9, EYE_HAPPY, IN_OUT],
  [0.97, EYE_PILL],
  [1, EYE_PILL],
]);

const PENSANDO_EYE = track(4, [
  [0, EYE_SMALL],
  [0.44, EYE_SMALL, IN],
  [0.455, EYE_BLINK, OUT],
  [0.475, EYE_SMALL],
  [1, EYE_SMALL],
]);

export const MOODS: Record<MascotMood, MoodConfig> = {
  idle: bothEyes({ pose: EYE_PILL, track: IDLE_BLINK }),
  feliz: bothEyes({ pose: EYE_HAPPY, track: FELIZ_EYE }),
  durmiendo: bothEyes({ pose: EYE_SLEEP }),
  pensando: bothEyes({ pose: EYE_SMALL, track: PENSANDO_EYE }),
};
