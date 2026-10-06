import {
  ISOLOGO_FACE,
  ISOLOGO_FACE_TRANSFORM,
  ISOLOGO_LETTERS,
  ISOLOGO_SIZE,
  ISOLOGO_VIEWBOX,
} from "@/components/brand/logoPaths";
import { KiboMascot } from "@/components/mascot/KiboMascot";
import {
  BODY_INK_HALF,
  BODY_RING,
  EYE_LEFT,
  EYE_PILL,
  EYE_RIGHT,
  MASCOT_EYE_CREAM,
  MASCOT_EYE_INK,
  MASCOT_GOLD,
  MASCOT_INK,
} from "@/components/mascot/shapes";
import type { MascotMood } from "@/components/mascot/types";

type KiboLogoProps = {
  className?: string;
  /** Con `mood`, la "o" es la mascota animada. */
  mood?: MascotMood;
};

const percent = (value: number, total: number) => `${(value / total) * 100}%`;

const FACE_BOX = {
  left: percent(ISOLOGO_FACE.x, ISOLOGO_SIZE.width),
  top: percent(ISOLOGO_FACE.y, ISOLOGO_SIZE.height),
  width: percent(100 * ISOLOGO_FACE.scale, ISOLOGO_SIZE.width),
  height: percent(100 * ISOLOGO_FACE.scale, ISOLOGO_SIZE.height),
};

export function KiboLogo({ className = "", mood }: KiboLogoProps) {
  if (mood) {
    return (
      <span role="img" aria-label="Kibo" className={`relative inline-block ${className}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={ISOLOGO_VIEWBOX}
          aria-hidden
          className="block h-full w-auto overflow-visible"
        >
          <path fill="currentColor" d={ISOLOGO_LETTERS} />
        </svg>
        <span className="absolute" style={FACE_BOX}>
          <KiboMascot mood={mood} shadow={false} size={64} className="block h-full w-full" />
        </span>
      </span>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={ISOLOGO_VIEWBOX}
      role="img"
      aria-label="Kibo"
      className={className}
    >
      <title>Kibo</title>
      <path fill="currentColor" d={ISOLOGO_LETTERS} />
      <g transform={ISOLOGO_FACE_TRANSFORM}>
        <path d={BODY_RING} fill={MASCOT_GOLD} fillRule="evenodd" />
        <path d={BODY_INK_HALF} fill={MASCOT_INK} />
        <path transform={`translate(${EYE_LEFT.x} ${EYE_LEFT.y})`} d={EYE_PILL} fill={MASCOT_EYE_INK} />
        <path transform={`translate(${EYE_RIGHT.x} ${EYE_RIGHT.y})`} d={EYE_PILL} fill={MASCOT_EYE_CREAM} />
      </g>
    </svg>
  );
}
