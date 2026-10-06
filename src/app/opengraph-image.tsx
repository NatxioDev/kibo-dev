import { ImageResponse } from "next/og";
import { IMAGOTIPO_LETTERS } from "@/components/brand/logoPaths";
import {
  BODY_INK_HALF,
  BODY_RING,
  EYE_HAPPY,
  EYE_LEFT,
  EYE_RIGHT,
  MASCOT_EYE_CREAM,
  MASCOT_EYE_INK,
  MASCOT_GOLD,
} from "@/components/mascot/shapes";

export const alt = "Kibo, tu gestor personal de gastos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BACKGROUND = "#14120d";
const INK_ON_DARK = "#2b2619";

const svgSrc = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const mascotSrc = svgSrc(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<path d="${BODY_RING}" fill="${MASCOT_GOLD}" fill-rule="evenodd"/>` +
    `<path d="${BODY_INK_HALF}" fill="${INK_ON_DARK}"/>` +
    `<path transform="translate(${EYE_LEFT.x} ${EYE_LEFT.y})" d="${EYE_HAPPY}" fill="${MASCOT_EYE_INK}"/>` +
    `<path transform="translate(${EYE_RIGHT.x} ${EYE_RIGHT.y})" d="${EYE_HAPPY}" fill="${MASCOT_EYE_CREAM}"/>` +
    `</svg>`,
);

/** Solo las letras "kibo" del imagotipo, recortadas sin el aro de la mascota. */
const LOGOTIPO_BOX = { x: 107.92, width: 203.05, height: 84.4 };

const logotipoSrc = svgSrc(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGOTIPO_BOX.x} 0 ${LOGOTIPO_BOX.width} ${LOGOTIPO_BOX.height}">` +
    `<path fill="${MASCOT_EYE_CREAM}" d="${IMAGOTIPO_LETTERS}"/>` +
    `</svg>`,
);

const LOGO_WIDTH = 460;
const LOGO_HEIGHT = Math.round((LOGO_WIDTH * LOGOTIPO_BOX.height) / LOGOTIPO_BOX.width);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 72,
          backgroundColor: BACKGROUND,
          backgroundImage: [
            "radial-gradient(circle at 27% 50%, rgba(224, 169, 59, 0.30), transparent 32%)",
            "radial-gradient(circle at 80% 12%, rgba(196, 176, 130, 0.16), transparent 30%)",
            "radial-gradient(circle at 70% 95%, rgba(168, 148, 104, 0.20), transparent 34%)",
            "radial-gradient(circle at 4% 96%, rgba(140, 120, 80, 0.22), transparent 28%)",
          ].join(", "),
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={mascotSrc} width={320} height={320} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={logotipoSrc} width={LOGO_WIDTH} height={LOGO_HEIGHT} />
          <div
            style={{
              marginTop: 28,
              fontSize: 40,
              lineHeight: 1.2,
              color: MASCOT_EYE_CREAM,
              opacity: 0.85,
            }}
          >
            Tus gastos, claros y en orden.
          </div>
          <div
            style={{
              marginTop: 28,
              padding: "10px 22px",
              borderRadius: 999,
              fontSize: 26,
              color: BACKGROUND,
              backgroundColor: MASCOT_GOLD,
            }}
          >
            Gestor personal de gastos
          </div>
        </div>
      </div>
    ),
    size,
  );
}
