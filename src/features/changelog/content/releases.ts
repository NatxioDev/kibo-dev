import type { Release } from "@/features/changelog/types";

/**
 * Novedades visibles para el usuario, de la versión más nueva a la más vieja.
 * Textos en español y sin jerga técnica. Las versiones mayores a la de
 * `package.json` no se muestran hasta que se publiquen.
 */
export const RELEASES: Release[] = [
  {
    version: "0.9.0",
    date: "2026-09-29",
    title: "Tus cuentas en Kibo",
    new: [
      "Crea y administra tus cuentas (ahorros, efectivo, bancos…) desde Ajustes → Cuentas.",
      "Al registrar un movimiento eliges de qué cuenta sale o entra el dinero.",
      "Puedes filtrar tus transacciones por cuenta; las antiguas aparecen como “Sin cuenta”.",
      "Puedes ocultar o mostrar el balance del dashboard con un toque en el ícono del ojo.",
      "Kibo recuerda tu preferencia de visibilidad del balance en este dispositivo.",
    ],
    fixes: [
      "Si aún no tienes movimientos en el período, el dashboard ya no muestra una barra de ingresos y gastos al 50%.",
      ],
    improvements: [
      "Nueva bienvenida en el login: descubre qué puedes hacer con Kibo tocando los emojis flotantes.",
    ],
  },
  {
    version: "0.8.0",
    date: "2026-09-27",
    title: "Entra con Passkey",
    new: [
      "Puedes iniciar sesión con una Passkey, sin escribir contraseña ni email.",
      "Desde Ajustes → Seguridad registras, renombras o eliminas tus Passkeys.",
      "Google sigue disponible como respaldo si pierdes el dispositivo.",
    ],
    improvements: [
      "El login con Passkey aparece marcado como beta mientras afinamos la experiencia.",
    ],
  },
  {
    version: "0.7.1",
    date: "2026-09-27",
    fixes: [
      "Los nombres de categorías y métodos de pago tienen un límite de caracteres para que no se desborden en la pantalla.",
      "Cada categoría admite un solo emoji como ícono.",
    ],
  },
  {
    version: "0.7.0",
    date: "2026-09-26",
    title: "Amigos en Kibo",
    new: [
      "Ahora puedes buscar a tus amigos por su @username y enviarles una solicitud.",
      "Acepta o rechaza solicitudes desde la nueva sección Amigos, con un aviso cuando tienes solicitudes pendientes.",
      "Divide un gasto con tus amigos: en tus movimientos queda solo tu parte y Kibo lleva la cuenta de quién le debe a quién.",
      "Marca cuando pagas o cobras una deuda y mira el saldo con cada amigo en la sección Amigos.",
      "Nueva sección Novedades en Ajustes para enterarte de lo nuevo en cada versión.",
    ],
    improvements: [
      "Kibo guarda y carga tus datos de forma más segura y rápida.",
    ],
  },
  {
    version: "0.6.0",
    date: "2026-09-26",
    title: "Instala Kibo fácilmente",
    new: [
      "Nueva sección Instalar app en Ajustes, con una guía paso a paso para tu celular o computadora.",
    ],
  },
  {
    version: "0.5.1",
    date: "2026-09-26",
    fixes: [
      "La barra de estado del iPhone vuelve a verse bien cuando usas Kibo instalada.",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-09-26",
    title: "Kibo como app",
    new: [
      "Puedes instalar Kibo en tu pantalla de inicio y abrirla como cualquier otra app.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-09-26",
    new: [
      "Ajustes ahora muestra la versión de Kibo y que estamos en etapa beta.",
    ],
  },
];
