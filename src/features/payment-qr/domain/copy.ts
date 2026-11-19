import type { PaymentQrValidity } from "@/features/payment-qr/domain/validity";

export const PAYMENT_QR_CONSENT_TEXT =
  "Acepto que Kibo guarde esta imagen, que puede incluir mi nombre, número de cuenta, entidad financiera y otros datos, únicamente para mostrarla a las personas que tienen una deuda abierta conmigo. La imagen se aloja en servidores de Supabase. Declaro que la cuenta es mía o que tengo autorización de su titular.";

export const PAYMENT_QR_REMINDER =
  "Escanea el QR con la app de tu banco: Kibo solo lo muestra y no procesa el pago.";

export const PAYMENT_QR_VERIFY_NOTE =
  "Verifica en tu app el destinatario, el monto y la vigencia antes de confirmar.";

export const PAYMENT_QR_UPLOAD_INTRO =
  "Sube la imagen del QR tal como te la dio tu banco. Solo la verán las personas que tienen una deuda abierta contigo. Puedes reemplazarla o eliminarla cuando quieras. Si sabes hasta cuándo vale, indica la fecha. Es opcional.";

export const PAYMENT_QR_FILE_HINT =
  "PNG, JPG o WEBP, hasta 2 MB. Kibo no recorta ni modifica la imagen.";

export const PAYMENT_QR_REPLACE_WARNING =
  "Para reemplazar el QR, confirma que eres tú. El QR actual se elimina y avisamos a quienes te deben que hay uno nuevo.";

export const PAYMENT_QR_GOOGLE_REAUTH_NOTE =
  "Si confirmas con Google, vas a volver a esta pantalla y tendrás que elegir la imagen otra vez.";

export const PAYMENT_QR_DELETE_TITLE = "¿Eliminar el QR?";

export const PAYMENT_QR_DELETE_DESCRIPTION =
  "Se borra de forma permanente y quienes te deben ya no lo verán.";

export const PAYMENT_QR_AFTER_PAY =
  "El pago se hace en la app de tu banco. Kibo no se entera: cuando lo hagas, márcalo en la deuda.";

export const PAYMENT_QR_SAVE_NOTE =
  "Si guardas la imagen en tu teléfono, esa copia queda fuera de Kibo.";

export const PAYMENT_QR_UNKNOWN_VALIDITY =
  "Vigencia desconocida. Verifica en tu banco antes de pagar. Si tu banco lo rechaza, pídele a quien lo subió una imagen nueva.";

export const PAYMENT_QR_PRIVACY_PARAGRAPHS = [
  "Puedes subir una imagen de QR que generó tu entidad financiera, para que las personas con una deuda abierta contigo la vean y paguen desde la app de su banco. Kibo no genera, modifica, decodifica ni valida esa imagen. Tampoco procesa, inicia ni confirma pagos, y no recibe ni custodia fondos. El pago lo hace la entidad financiera, con sus propias condiciones. Quien paga verifica en su app el destinatario, el monto y la vigencia antes de confirmar.",
  "La imagen puede incluir datos personales y financieros, como el nombre del beneficiario, un número de cuenta o teléfono, la entidad, un monto, un concepto o una fecha. La finalidad es única: mostrarla a quienes tienen una deuda abierta contigo. No la usamos para publicidad, analítica ni para entrenar modelos.",
  "La ven el dueño de la imagen y esas personas mientras la deuda siga abierta. Al saldar todas las deudas, dejan de verla. El archivo se aloja en un bucket privado de Supabase Pte. Ltd. (Singapur), encargado del tratamiento, sobre infraestructura de Amazon Web Services en la región del proyecto. El acceso usa reglas de base de datos y enlaces de corta duración. No publicamos la imagen ni la indexamos.",
  "Guardamos la imagen mientras tú la mantengas. Al reemplazarla o eliminarla, o al borrar tu cuenta, pedimos el borrado del archivo. Las copias de seguridad del proveedor pueden conservarlo un tiempo adicional. Si otra persona guardó la imagen en su teléfono, esa copia queda fuera de Kibo.",
  "Puedes eliminar la imagen en cualquier momento desde Ajustes. Para acceder, rectificar, oponerte o pedir la supresión del resto de datos, escríbenos al correo de contacto. Esta función es para personas mayores de edad. Quien sube la imagen declara que la cuenta es suya o que el titular lo autorizó.",
  "Kibo responde por lo que controla: la seguridad del archivo, quién puede verlo y el borrado. La descripción de este alcance no quita esa responsabilidad.",
] as const;

export function paymentQrValidityMessage(
  validity: PaymentQrValidity,
  expiresOnLabel: string | null,
  ownerName: string,
  viewerIsOwner: boolean,
): string {
  if (validity === "desconocida") return PAYMENT_QR_UNKNOWN_VALIDITY;
  const fuente = viewerIsOwner ? "la fecha que indicaste" : ownerName;
  if (validity === "vencido") {
    return `Según ${fuente}, este QR venció el ${expiresOnLabel ?? "la fecha indicada"}. Es probable que tu banco lo rechace.`;
  }
  return `Vigente hasta ${expiresOnLabel ?? "la fecha indicada"} (según ${fuente}). Kibo no valida este QR.`;
}

export function paymentQrUploaderLine(
  ownerName: string,
  whenLabel: string,
  replaced: boolean,
  viewerIsOwner: boolean,
): string {
  if (viewerIsOwner) {
    return replaced ? `Lo actualizaste el ${whenLabel}.` : `Lo subiste el ${whenLabel}.`;
  }
  return replaced
    ? `${ownerName} lo actualizó el ${whenLabel}.`
    : `${ownerName} lo subió el ${whenLabel}.`;
}

export function paymentQrAmountHint(balanceLabel: string | null): string {
  if (!balanceLabel) {
    return "El monto de la imagen, si lo tiene, lo definió el banco al generarla y puede no coincidir con el saldo en Kibo.";
  }
  return `El monto de la imagen, si lo tiene, lo definió el banco al generarla y puede no coincidir con el saldo en Kibo: ${balanceLabel}.`;
}

export function paymentQrEmptyForDebtor(ownerName: string): string {
  return `${ownerName} todavía no subió un QR. Cuando lo haga, lo vas a ver acá para escanearlo con la app de tu banco.`;
}

export function paymentQrReplacedNotice(ownerName: string, whenLabel: string): string {
  return `${ownerName} actualizó el QR el ${whenLabel}. Verifica los datos en tu banco antes de pagar.`;
}

export function paymentQrDeletedNotice(ownerName: string, whenLabel: string): string {
  return `${ownerName} quitó el QR el ${whenLabel}.`;
}

/** Textos de la función, para comprobar que no usan las palabras prohibidas. */
export function paymentQrCopySamples(): string[] {
  return [
    PAYMENT_QR_CONSENT_TEXT,
    PAYMENT_QR_REMINDER,
    PAYMENT_QR_VERIFY_NOTE,
    PAYMENT_QR_UPLOAD_INTRO,
    PAYMENT_QR_FILE_HINT,
    PAYMENT_QR_REPLACE_WARNING,
    PAYMENT_QR_GOOGLE_REAUTH_NOTE,
    PAYMENT_QR_DELETE_TITLE,
    PAYMENT_QR_DELETE_DESCRIPTION,
    PAYMENT_QR_AFTER_PAY,
    PAYMENT_QR_SAVE_NOTE,
    PAYMENT_QR_UNKNOWN_VALIDITY,
    ...PAYMENT_QR_PRIVACY_PARAGRAPHS,
    paymentQrValidityMessage("vigente", "14 nov 2026", "Ana", false),
    paymentQrValidityMessage("vencido", "1 ene 2026", "Ana", true),
    paymentQrValidityMessage("desconocida", null, "Ana", false),
    paymentQrUploaderLine("Ana", "14 nov 2026, 10:00", true, false),
    paymentQrUploaderLine("Ana", "14 nov 2026, 10:00", false, true),
    paymentQrAmountHint("Bs 20,00"),
    paymentQrAmountHint(null),
    paymentQrEmptyForDebtor("Ana"),
    paymentQrReplacedNotice("Ana", "14 nov 2026, 10:00"),
    paymentQrDeletedNotice("Ana", "14 nov 2026, 10:00"),
    "QR de cobro",
    "Usa una imagen PNG, JPG o WEBP de hasta 2 MB. Kibo no modifica el archivo.",
    "La imagen es muy chica o demasiado grande. Usa una de entre 100 y 4096 píxeles, sin recortar el QR.",
    "No pudimos leer esa imagen. Prueba con PNG o JPG, sin editar el QR.",
  ];
}
