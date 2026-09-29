export type EmojiPosition = {
  /** Porcentaje desde arriba del contenedor. */
  top: number;
  /** Porcentaje desde la izquierda del contenedor. */
  left: number;
};

/**
 * En mobile el contenido ocupa todo el ancho, así que los emojis se anclan en
 * px desde el centro del contenido (que está centrado vertical y
 * horizontalmente) y se reparten alrededor del logo.
 */
export type EmojiOffset = {
  x: number;
  y: number;
};

/** Centro del logo en mobile, desde donde los emojis "salen" al entrar. */
export const MOBILE_LOGO_ANCHOR: EmojiOffset = { x: 0, y: -189 };

/** Cada emoji representa una funcionalidad real de Kibo. */
export type WelcomeEmoji = {
  id: string;
  emoji: string;
  label: string;
  size: "sm" | "md" | "lg";
  desktop: EmojiPosition;
  /** Sin posición mobile, el emoji solo aparece en desktop. */
  mobile?: EmojiOffset;
  float: {
    x: number;
    y: number;
    rotate: number;
    duration: number;
    delay: number;
  };
  twinkle?: boolean;
  /** Intensidad del parallax con el mouse en desktop. */
  depth: number;
};

export const WELCOME_EMOJIS: WelcomeEmoji[] = [
  {
    id: "register",
    emoji: "💸",
    label: "Registra gastos e ingresos en segundos.",
    size: "lg",
    desktop: { top: 14, left: 14 },
    mobile: { x: -148, y: -252 },
    float: { x: 6, y: 10, rotate: 6, duration: 9, delay: -2 },
    depth: 18,
  },
  {
    id: "categories",
    emoji: "📊",
    label: "Mira en qué categorías se va tu plata.",
    size: "md",
    desktop: { top: 20, left: 80 },
    mobile: { x: -58, y: -292 },
    float: { x: -5, y: 8, rotate: -5, duration: 11, delay: -5 },
    depth: 12,
  },
  {
    id: "passkey",
    emoji: "🔑",
    label: "Entra con Passkey, sin contraseñas.",
    size: "sm",
    desktop: { top: 36, left: 73 },
    mobile: { x: 150, y: -198 },
    float: { x: 4, y: 6, rotate: 12, duration: 7, delay: -1 },
    depth: 26,
  },
  {
    id: "movements",
    emoji: "🧾",
    label: "Revisa y filtra todos tus movimientos.",
    size: "md",
    desktop: { top: 56, left: 9 },
    float: { x: 5, y: 9, rotate: 4, duration: 10, delay: -7 },
    depth: 10,
  },
  {
    id: "balance",
    emoji: "💰",
    label: "Tu balance del mes, de un vistazo.",
    size: "lg",
    desktop: { top: 52, left: 87 },
    float: { x: -6, y: 12, rotate: -7, duration: 12, delay: -3 },
    twinkle: true,
    depth: 8,
  },
  {
    id: "friends",
    emoji: "👥",
    label: "Divide gastos con amigos y salda deudas.",
    size: "md",
    desktop: { top: 82, left: 20 },
    mobile: { x: 124, y: -280 },
    float: { x: 4, y: 7, rotate: -4, duration: 8, delay: -4 },
    depth: 14,
  },
  {
    id: "currency",
    emoji: "💱",
    label: "Bolivianos y dólares en un solo lugar.",
    size: "sm",
    desktop: { top: 90, left: 54 },
    mobile: { x: 38, y: -258 },
    float: { x: 3, y: 6, rotate: 14, duration: 7.5, delay: -6 },
    depth: 22,
  },
  {
    id: "accounts",
    emoji: "🏦",
    label: "Separa tu plata por cuentas: banco, efectivo, ahorros.",
    size: "md",
    desktop: { top: 78, left: 79 },
    mobile: { x: -140, y: -166 },
    float: { x: -4, y: 9, rotate: 5, duration: 9.5, delay: -8 },
    depth: 16,
  },
];
