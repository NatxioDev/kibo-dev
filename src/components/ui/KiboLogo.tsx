import {
  ISOLOGO_FACE_TRANSFORM,
  ISOLOGO_LETTERS,
  ISOLOGO_VIEWBOX,
} from "@/components/brand/logoPaths";
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

type KiboLogoProps = {
  className?: string;
};

export function KiboLogo({ className = "" }: KiboLogoProps) {
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
