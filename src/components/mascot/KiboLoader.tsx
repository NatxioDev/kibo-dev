import {
  BODY_INK_HALF,
  BODY_RING,
  EYE_LEFT,
  EYE_PILL,
  EYE_RIGHT,
  FACE_GOLD_HALF,
  FACE_INK_HALF,
  MASCOT_EYE_CREAM,
  MASCOT_EYE_INK,
  MASCOT_GOLD,
  MASCOT_INK,
} from "./shapes";
import styles from "./KiboLoader.module.css";

type KiboLoaderProps = {
  variant?: "screen" | "compact";
  size?: number;
  /** `null` lo vuelve decorativo, para cuando el contenedor ya anuncia la espera. */
  label?: string | null;
  className?: string;
};

function Eyes() {
  return (
    <g className={styles.eyes}>
      <path transform={`translate(${EYE_LEFT.x} ${EYE_LEFT.y})`} d={EYE_PILL} fill={MASCOT_EYE_INK} />
      <path transform={`translate(${EYE_RIGHT.x} ${EYE_RIGHT.y})`} d={EYE_PILL} fill={MASCOT_EYE_CREAM} />
    </g>
  );
}

function ScreenArt() {
  return (
    <g className={styles.breathe}>
      <g className={styles.spin}>
        <path d={BODY_RING} fill={MASCOT_GOLD} fillRule="evenodd" />
        <path d={BODY_INK_HALF} fill={MASCOT_INK} />
        <Eyes />
      </g>
    </g>
  );
}

function CompactArt() {
  return (
    <>
      <circle cx="50" cy="50" r="44" fill="none" stroke={MASCOT_GOLD} strokeOpacity={0.25} strokeWidth="7" />
      <g className={styles.arc}>
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={MASCOT_GOLD}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="90 400"
        />
      </g>
      <g transform="translate(50 50) scale(0.84) translate(-50 -50)">
        <path d={FACE_GOLD_HALF} fill={MASCOT_GOLD} />
        <path d={FACE_INK_HALF} fill={MASCOT_INK} />
        <Eyes />
      </g>
    </>
  );
}

export function KiboLoader({
  variant = "compact",
  size = 20,
  label = "Cargando…",
  className = "",
}: KiboLoaderProps) {
  const decorative = label === null;

  return (
    <span
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
      className={`inline-flex shrink-0 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={variant === "screen" ? "2 2 96 96" : "0 0 100 100"}
        width={size}
        height={size}
        aria-hidden
        className={`${styles.loader} ${styles[variant]}`}
      >
        {variant === "screen" ? <ScreenArt /> : <CompactArt />}
      </svg>
    </span>
  );
}
