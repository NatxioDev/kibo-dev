export const TERMS_EFFECTIVE_DATE = "17 de noviembre de 2026";
export const TERMS_CONTACT_EMAIL = "hola@usekibo.app";

export type TermsBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type TermsSection = {
  id?: string;
  title: string;
  blocks: TermsBlock[];
};

export const TERMS_INTRO = [
  "Estos términos explican qué podés esperar de Kibo y qué queda de tu lado. Al crear una cuenta, o al seguir usando Kibo desde la fecha de vigencia, los aceptás.",
  "Cómo tratamos tus datos está en la política de privacidad. Aceptar estos términos no reemplaza el consentimiento específico para guardar una imagen de QR.",
];

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. Qué es Kibo",
    blocks: [
      {
        type: "p",
        text: "Kibo es una app personal para registrar tus ingresos y gastos, y para anotar lo que compartís con tus amigos.",
      },
      {
        type: "p",
        text: "Kibo no guarda ni mueve dinero. No procesa, inicia ni confirma pagos, y no recibe ni custodia fondos. Cuando el dinero se mueve, se mueve en el banco de cada persona, fuera de Kibo.",
      },
    ],
  },
  {
    title: "2. Cuenta y acceso",
    blocks: [
      {
        type: "p",
        text: "Para usar Kibo necesitás una cuenta. Podés entrar con Google o con una Passkey.",
      },
      {
        type: "p",
        text: "Vos cuidás el acceso a tu cuenta. Si otra persona entra con tu sesión, lo que haga queda registrado como tuyo. Si perdés el acceso, escribinos al correo de contacto.",
      },
      {
        type: "p",
        text: "Subir una imagen de QR es una función para personas mayores de edad.",
      },
    ],
  },
  {
    title: "3. Uso aceptable",
    blocks: [
      {
        type: "p",
        text: "Usá Kibo para tu registro personal y para las deudas que llevás con personas que conocés.",
      },
      {
        type: "p",
        text: "No uses Kibo para engañar, para cargar datos de otra persona sin su autorización, para entrar a una cuenta ajena ni para intentar vulnerar el servicio. Podemos limitar o cerrar una cuenta cuando hace falta para proteger a otras personas o al servicio, y te avisamos cuando es posible.",
      },
    ],
  },
  {
    title: "4. Gastos compartidos y deudas",
    blocks: [
      {
        type: "p",
        text: "Cuando dividís un gasto, Kibo anota quién lo pagó y cuánto queda pendiente entre ustedes. Ese saldo es un registro entre amigos.",
      },
      {
        type: "p",
        text: "Kibo solo registra. No te cobra esa deuda ni se la cobra a la otra persona, y no comprueba con el banco si el pago ocurrió. Cuando se pagan, lo hacen por su cuenta y después lo marcan en Kibo.",
      },
    ],
  },
  {
    id: "qr-de-cobro",
    title: "5. QR de cobro",
    blocks: [
      {
        type: "p",
        text: "Kibo te permite guardar y mostrar, a las personas que tienen una deuda abierta con vos, la imagen de un QR que generó tu entidad financiera.",
      },
      {
        type: "p",
        text: "Kibo no genera, modifica, decodifica ni valida ese QR. No procesa, inicia ni confirma el pago, y no recibe ni custodia fondos. El pago se hace en la entidad financiera de quien paga, con las condiciones de esa entidad.",
      },
      {
        type: "p",
        text: "Quien paga tiene que verificar en su app el destinatario, el monto y la vigencia antes de confirmar. El monto de la imagen, si lo tiene, lo definió el banco al generarla y puede no coincidir con el saldo que muestra Kibo.",
      },
      {
        type: "p",
        text: "Quien sube la imagen declara que la cuenta es suya o de un titular que lo autorizó, y que el QR es legítimo. La finalidad es única: mostrarla a quienes hoy te deben. Cuando se saldan todas esas deudas, dejan de verla.",
      },
      {
        type: "p",
        text: "Podés reemplazarla o eliminarla cuando quieras. Para reemplazarla, Kibo te pide que confirmes que sos vos. Si la reemplazás, avisamos a quienes tienen una deuda abierta con vos. Kibo puede ocultar o eliminar la imagen cuando se saldan las deudas, cuando la eliminás, cuando se borra la cuenta, cuando se reporta un uso indebido o por seguridad del archivo, y te avisa cuando es posible.",
      },
      {
        type: "p",
        text: "Kibo responde por la seguridad del archivo, por quién puede verlo y por el borrado. Si alguien guarda una copia en su teléfono, esa copia queda fuera de Kibo.",
      },
      {
        type: "p",
        text: "La fecha de vigencia, si la cargás, es manual. Los estados Vigente, Vencido y Vigencia desconocida salen solo de esa fecha. Kibo no consulta al banco si el QR sigue sirviendo.",
      },
    ],
  },
  {
    title: "6. Propiedad intelectual",
    blocks: [
      {
        type: "p",
        text: "El software, el nombre Kibo, la mascota, el diseño y los textos de la app pertenecen a sus titulares. No podés copiarlos ni usarlos como si fueran tuyos.",
      },
      {
        type: "p",
        text: "Lo que vos cargás, como tus movimientos, tus notas y la imagen del QR, sigue siendo tuyo. Nos das permiso solo para guardarlo y mostrarlo como describen estos términos y la política de privacidad, para prestarte el servicio.",
      },
    ],
  },
  {
    title: "7. Limitación de responsabilidad",
    blocks: [
      {
        type: "p",
        text: "Kibo te muestra lo que vos y tus amigos registran. No garantiza que un saldo sea exacto, que alguien te pague ni que un QR siga siendo aceptado por un banco.",
      },
      {
        type: "p",
        text: "Estas frases describen el alcance del servicio. No le quitan a Kibo la responsabilidad por lo que sí controla: guardar el registro, decidir quién ve la imagen del QR y borrarla cuando corresponde.",
      },
    ],
  },
  {
    title: "8. Cambios a estos términos",
    blocks: [
      {
        type: "p",
        text: "Podemos actualizar estos términos. La fecha de vigencia de esta página cambia cuando lo hacemos.",
      },
      {
        type: "p",
        text: "Si un cambio es material, por ejemplo decodificar el QR, integrarnos con un banco o usar la imagen para otra finalidad, te lo avisamos y hace falta una aceptación nueva. Tu silencio no cuenta como aceptación.",
      },
    ],
  },
  {
    title: "9. Ley aplicable",
    blocks: [
      {
        type: "p",
        text: "Estos términos se rigen por las leyes del Estado Plurinacional de Bolivia. Cualquier controversia se trata ante los tribunales competentes de Bolivia.",
      },
    ],
  },
  {
    title: "10. Contacto",
    blocks: [
      {
        type: "p",
        text: `Si tenés una pregunta sobre estos términos, escribinos a ${TERMS_CONTACT_EMAIL}.`,
      },
    ],
  },
];

export function termsCopySamples(): string[] {
  const samples = [...TERMS_INTRO];
  for (const section of TERMS_SECTIONS) {
    samples.push(section.title);
    for (const block of section.blocks) {
      if (block.type === "p") samples.push(block.text);
      else samples.push(...block.items);
    }
  }
  return samples;
}
