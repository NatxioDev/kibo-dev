"use client";

import { motion } from "motion/react";
import { useState, type AnimationEvent } from "react";
import { usePrefersReducedMotion } from "@/components/motion/usePrefersReducedMotion";
import { CALMING_MOODS, MOODS, type EyeConfig } from "./moods";
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
  /** Los estados expresivos se reproducen 2 ciclos y vuelven a `idle`. */
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

  if (mood === "preocupado") {
    return (
      <path
        className={styles.drop}
        d="M90 14C90 14 85.5 20.5 85.5 23.7A4.5 4.5 0 0 0 94.5 23.7C94.5 20.5 90 14 90 14Z"
        fill="#8DB8DE"
      />
    );
  }

  if (mood === "guino") {
    return (
      <g fill={MASCOT_GOLD}>
        <path className={styles.spark} d="M94 6L96.2 12.8L103 15L96.2 17.2L94 24L91.8 17.2L85 15L91.8 12.8Z" />
        <path
          className={`${styles.spark} ${styles.spark2}`}
          d="M106 26L107.1 29.4L110.5 30.5L107.1 31.6L106 35L104.9 31.6L101.5 30.5L104.9 29.4Z"
        />
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
  const [prevMood, setPrevMood] = useState(mood);
  const [calmed, setCalmed] = useState(false);
  if (prevMood !== mood) {
    setPrevMood(mood);
    setCalmed(false);
  }

  const shown = calmed ? "idle" : mood;
  const config = MOODS[shown];
  const detailed = size >= DETAIL_MIN_SIZE;

  function handleBodyAnimationEnd(event: AnimationEvent<SVGGElement>) {
    if (event.target === event.currentTarget && CALMING_MOODS.has(shown)) setCalmed(true);
  }

  return (
    <svg
      key={shown}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      data-mood={shown}
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
      <g className={styles.body} onAnimationEnd={handleBodyAnimationEnd}>
        <path d={BODY_RING} fill={MASCOT_GOLD} fillRule="evenodd" />
        <path d={BODY_INK_HALF} fill={MASCOT_INK} />
        <g className={styles.eyes}>
          <g transform={`translate(${EYE_LEFT.x} ${EYE_LEFT.y})`}>
            <g className={styles.eyeL}>
              <Eye eye={config.left} fill={MASCOT_EYE_INK} still={reduceMotion} />
            </g>
          </g>
          <g transform={`translate(${EYE_RIGHT.x} ${EYE_RIGHT.y})`}>
            <g className={styles.eyeR}>
              <Eye eye={config.right} fill={MASCOT_EYE_CREAM} still={reduceMotion} />
            </g>
          </g>
        </g>
      </g>
      {detailed ? <Extras mood={shown} /> : null}
    </svg>
  );
}
