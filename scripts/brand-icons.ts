/**
 * Genera los SVG de marca desde las formas de la mascota y rasteriza los PNG y el favicon.ico.
 * Requiere `rsvg-convert` (brew install librsvg). Uso: `bun run brand:icons`.
 *
 * Los archivos que referencian `layout.tsx` y `manifest.ts` llevan `ASSET_VERSION` en el nombre
 * para que navegadores y PWAs instaladas no sigan mostrando el ícono anterior desde caché.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  IMAGOTIPO_FACE_TRANSFORM,
  IMAGOTIPO_LETTERS,
  IMAGOTIPO_VIEWBOX,
  ISOLOGO_FACE_TRANSFORM,
  ISOLOGO_LETTERS,
  ISOLOGO_VIEWBOX,
} from "../src/components/brand/logoPaths";
import {
  BODY_INK_HALF,
  BODY_RING,
  EYE_LEFT,
  EYE_PILL,
  EYE_RIGHT,
  MASCOT_EYE_CREAM,
  MASCOT_EYE_INK,
  MASCOT_GOLD,
} from "../src/components/mascot/shapes";

export const ASSET_VERSION = "v3";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BRAND_DIR = join(ROOT, "public/brand");
const FAVICON_ICO = join(ROOT, "src/app/favicon.ico");

const INK = "#14120d";
const RAISED_INK = "#2b2619";
const CREAM_TEXT = "#f3ecd9";

/** `inkAttrs` pinta la mitad tinta: un `fill` fijo o una clase controlada por CSS. */
function face(inkAttrs: string) {
  return [
    `<path d="${BODY_RING}" fill="${MASCOT_GOLD}" fill-rule="evenodd"/>`,
    `<path d="${BODY_INK_HALF}" ${inkAttrs}/>`,
    `<path transform="translate(${EYE_LEFT.x} ${EYE_LEFT.y})" d="${EYE_PILL}" fill="${MASCOT_EYE_INK}"/>`,
    `<path transform="translate(${EYE_RIGHT.x} ${EYE_RIGHT.y})" d="${EYE_PILL}" fill="${MASCOT_EYE_CREAM}"/>`,
  ].join("");
}

function svg(viewBox: string, body: string, size?: number) {
  const [, , width, height] = viewBox.split(" ");
  const dims = size ? `width="${size}" height="${size}"` : `width="${width}" height="${height}"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${dims} role="img" aria-label="Kibo"><title>Kibo</title>${body}</svg>\n`;
}

function wordmark(viewBox: string, letters: string, faceTransform: string, letterFill: string, ink: string) {
  return svg(
    viewBox,
    `<path fill="${letterFill}" d="${letters}"/><g transform="${faceTransform}">${face(`fill="${ink}"`)}</g>`,
  );
}

function appIcon(rounded: boolean) {
  const rect = `<rect width="1024" height="1024"${rounded ? ' rx="229"' : ""} fill="${INK}"/>`;
  return svg("0 0 1024 1024", `${rect}<g transform="translate(212 212) scale(6)">${face(`fill="${RAISED_INK}"`)}</g>`);
}

const faviconSvg = svg(
  "0 0 100 100",
  `<style>.ink{fill:${INK}}@media (prefers-color-scheme: dark){.ink{fill:${RAISED_INK}}}</style>${face('class="ink"')}`,
  32,
);

const svgs: Record<string, string> = {
  [`favicon-${ASSET_VERSION}.svg`]: faviconSvg,
  "isotipo.svg": svg("0 0 100 100", face(`fill="${INK}"`)),
  "app-icon.svg": appIcon(true),
  "app-icon-maskable.svg": appIcon(false),
  "isologo.svg": wordmark(ISOLOGO_VIEWBOX, ISOLOGO_LETTERS, ISOLOGO_FACE_TRANSFORM, "currentColor", INK),
  "isologo-light.svg": wordmark(ISOLOGO_VIEWBOX, ISOLOGO_LETTERS, ISOLOGO_FACE_TRANSFORM, INK, INK),
  "isologo-dark.svg": wordmark(ISOLOGO_VIEWBOX, ISOLOGO_LETTERS, ISOLOGO_FACE_TRANSFORM, CREAM_TEXT, RAISED_INK),
  "imagotipo.svg": wordmark(IMAGOTIPO_VIEWBOX, IMAGOTIPO_LETTERS, IMAGOTIPO_FACE_TRANSFORM, "currentColor", INK),
  "imagotipo-light.svg": wordmark(IMAGOTIPO_VIEWBOX, IMAGOTIPO_LETTERS, IMAGOTIPO_FACE_TRANSFORM, INK, INK),
  "imagotipo-dark.svg": wordmark(
    IMAGOTIPO_VIEWBOX,
    IMAGOTIPO_LETTERS,
    IMAGOTIPO_FACE_TRANSFORM,
    CREAM_TEXT,
    RAISED_INK,
  ),
};

const pngs: { name: string; source: string; size: number }[] = [
  { name: `favicon-32-${ASSET_VERSION}.png`, source: `favicon-${ASSET_VERSION}.svg`, size: 32 },
  { name: `app-icon-180-${ASSET_VERSION}.png`, source: "app-icon.svg", size: 180 },
  { name: `app-icon-192-${ASSET_VERSION}.png`, source: "app-icon.svg", size: 192 },
  { name: `app-icon-512-${ASSET_VERSION}.png`, source: "app-icon.svg", size: 512 },
  { name: `app-icon-maskable-512-${ASSET_VERSION}.png`, source: "app-icon-maskable.svg", size: 512 },
];

function rasterize(source: string, size: number) {
  return execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), source]);
}

/** ICO con PNG embebidos (soportado por todos los navegadores actuales). */
function buildIco(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

try {
  execFileSync("rsvg-convert", ["--version"], { stdio: "ignore" });
} catch {
  console.error("Falta rsvg-convert. Instálalo con: brew install librsvg");
  process.exit(1);
}

for (const [name, contents] of Object.entries(svgs)) {
  writeFileSync(join(BRAND_DIR, name), contents);
}

for (const { name, source, size } of pngs) {
  writeFileSync(join(BRAND_DIR, name), rasterize(join(BRAND_DIR, source), size));
}

const scratch = mkdtempSync(join(tmpdir(), "kibo-brand-"));
try {
  const faviconPath = join(scratch, "favicon.svg");
  writeFileSync(faviconPath, faviconSvg);
  writeFileSync(
    FAVICON_ICO,
    buildIco([16, 32, 48].map((size) => ({ size, png: rasterize(faviconPath, size) }))),
  );
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

const generated = new Set([...Object.keys(svgs), ...pngs.map(({ name }) => name)]);
for (const file of readdirSync(BRAND_DIR)) {
  if (/^(favicon|app-icon)/.test(file) && !generated.has(file)) {
    unlinkSync(join(BRAND_DIR, file));
    console.log(`eliminado ${file}`);
  }
}

console.log(`${generated.size} archivos en public/brand y src/app/favicon.ico (${readFileSync(FAVICON_ICO).length} B)`);
