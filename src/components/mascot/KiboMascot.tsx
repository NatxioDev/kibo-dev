"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@/components/motion/usePrefersReducedMotion";
import { MOODS, type EyeConfig } from "./moods";
import {
  BODY_INK_HALF,
  BODY_RING,
  EYE_LEFT,
  EYE_RIGHT,
  MASCOT_EYE_CREAM,
  MASCOT_EYE_INK,
  MASCOT_GOLD,
  MASCOT_INK,
} from "./shapes";
import type { MascotMood } from "./types";
import styles from "./KiboMascot.module.css";

/** Debajo de este tamaño la sombra y los extras (z, puntitos) no se leen y se omiten. */
const DETAIL_MIN_SIZE = 33;

type KiboMascotProps = {
  mood?: MascotMood;
  /** Lado de la caja de la "o" en px; saltos, sombra y extras se dibujan por fuera. */
  size?: number;
  shadow?: boolean;
  className?: string;
};

function Eye({ eye, fill, still }: { eye: EyeConfig; fill: string; still: boolean }) {
  const { track } = eye;
  if (still || !track) return <path d={eye.pose} fill={fill} />;

  return (
    <motion.path
      d={track.values[0]}
      fill={fill}
      animate={{ d: track.values }}
      transition={{
        duration: track.duration,
        times: track.times,
        ease: track.ease,
        repeat: Infinity,
      }}
    />
  );
}

function Extras({ mood }: { mood: MascotMood }) {
  if (mood === "durmiendo") {
    return (
      <g fill="var(--mascot-extra)" fontWeight={900} fontSize={13}>
        {[styles.z1, styles.z2, styles.z3].map((zClass) => (
          <text key={zClass} className={`${styles.z} ${zClass}`} x="80" y="20">
            z
          </text>
        ))}
      </g>
    );
  }

  if (mood === "pensando") {
    return (
      <g fill="var(--mascot-extra)">
        <circle className={`${styles.dot} ${styles.d1}`} cx="92" cy="18" r="3" />
        <circle className={`${styles.dot} ${styles.d2}`} cx="101" cy="10" r="3.6" />
        <circle className={`${styles.dot} ${styles.d3}`} cx="111" cy="1" r="4.2" />
      </g>
    );
  }

  return null;
}

export function KiboMascot({
  mood = "idle",
  size = 96,
  shadow = true,
  className = "",
}: KiboMascotProps) {
  const reduceMotion = usePrefersReducedMotion();
  const config = MOODS[mood];
  const detailed = size >= DETAIL_MIN_SIZE;

  return (
    <svg
      key={mood}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      data-mood={mood}
      className={`${styles.mascot} shrink-0 ${className}`}
    >
      {shadow && detailed ? (
        <ellipse
          className={styles.shadow}
          cx="50"
          cy="100"
          rx="30"
          ry="3.6"
          fill="var(--mascot-shadow)"
        />
      ) : null}
      <g className={styles.body}>
        <path d={BODY_RING} fill={MASCOT_GOLD} fillRule="evenodd" />
        <path d={BODY_INK_HALF} fill={MASCOT_INK} />
        <g className={styles.eyes}>
          <g transform={`translate(${EYE_LEFT.x} ${EYE_LEFT.y})`}>
            <Eye eye={config.left} fill={MASCOT_EYE_INK} still={reduceMotion} />
          </g>
          <g transform={`translate(${EYE_RIGHT.x} ${EYE_RIGHT.y})`}>
            <Eye eye={config.right} fill={MASCOT_EYE_CREAM} still={reduceMotion} />
          </g>
        </g>
      </g>
      {detailed ? <Extras mood={mood} /> : null}
    </svg>
  );
}
