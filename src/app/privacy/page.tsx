import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";

const CONTACT_EMAIL = "yamil.ignacio.paz.sea@gmail.com";
const LAST_UPDATED = "25 de septiembre de 2026";

export const metadata: Metadata = {
  title: "Política de privacidad · Kibo",
  description: "Cómo Kibo recopila, usa y protege tus datos.",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-balance text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-7 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(4rem,env(safe-area-inset-bottom))]">
      <PageHeader
        back={{ href: "/", label: "Kibo" }}
        title="Política de privacidad"
        description={`Última actualización: ${LAST_UPDATED}`}
      />

      <Card className="flex flex-col gap-8 px-6 py-7 text-[0.9375rem] leading-relaxed text-pretty text-foreground/85 sm:px-8 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-2 [&_a:hover]:underline">
        <p>
          Kibo es un gestor personal de ingresos y gastos. Esta política explica
          qué datos recopilamos cuando usas Kibo, cómo los usamos y qué derechos
          tienes sobre ellos.
        </p>

        <Section title="1. Datos que recopilamos">
          <p>Al iniciar sesión con Google recibimos de tu cuenta de Google:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tu dirección de correo electrónico.</li>
            <li>Tu nombre.</li>
            <li>Tu foto de perfil.</li>
          </ul>
          <p>Además, guardamos la información que tú ingresas en la app:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Tu nombre de usuario (@username) y nombre visible.</li>
            <li>
              Transacciones (montos, moneda, fechas, descripciones), categorías
              y métodos de pago.
            </li>
            <li>Los comentarios o reportes que nos envíes desde la app.</li>
          </ul>
          <p>
            No accedemos a tus contactos, correos, archivos ni a ningún otro
            dato de tu cuenta de Google.
          </p>
        </Section>

        <Section title="2. Cómo usamos tus datos">
          <ul className="list-disc space-y-1 pl-5">
            <li>Para identificarte e iniciar tu sesión.</li>
            <li>Para mostrar tu perfil dentro de la app.</li>
            <li>
              Para guardar y mostrarte tus transacciones, resúmenes y
              estadísticas.
            </li>
            <li>Para responder a tus comentarios y mejorar el servicio.</li>
          </ul>
          <p>
            No vendemos, alquilamos ni compartimos tus datos con terceros con
            fines publicitarios.
          </p>
        </Section>

        <Section title="3. Uso de datos de Google">
          <p>
            El uso que hace Kibo de la información recibida de las APIs de
            Google cumple con la{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de datos de usuario de los servicios de API de Google
            </a>
            , incluidos los requisitos de uso limitado.
          </p>
        </Section>

        <Section title="4. Dónde se almacenan">
          <p>
            Tus datos se almacenan en{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase
            </a>
            , nuestro proveedor de base de datos y autenticación. El acceso está
            protegido con políticas de seguridad a nivel de fila (RLS): cada
            usuario solo puede ver y modificar su propia información. Las
            comunicaciones viajan cifradas mediante HTTPS.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            Usamos únicamente cookies necesarias para mantener tu sesión
            iniciada y recordar tu preferencia de tema. No usamos cookies de
            publicidad ni de seguimiento de terceros.
          </p>
        </Section>

        <Section title="6. Conservación y eliminación">
          <p>
            Conservamos tus datos mientras tengas una cuenta en Kibo. Puedes
            solicitar la eliminación de tu cuenta y de todos tus datos en
            cualquier momento escribiéndonos a{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Atenderemos
            la solicitud en un plazo máximo de 30 días.
          </p>
        </Section>

        <Section title="7. Tus derechos">
          <p>
            Puedes acceder, corregir o eliminar tus datos. Tu nombre visible y
            nombre de usuario se pueden editar desde la configuración de la app;
            para cualquier otra solicitud, contáctanos. También puedes revocar
            el acceso de Kibo a tu cuenta de Google desde{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              myaccount.google.com/permissions
            </a>
            .
          </p>
        </Section>

        <Section title="8. Menores de edad">
          <p>
            Kibo no está dirigido a menores de 13 años y no recopilamos
            intencionalmente datos de menores.
          </p>
        </Section>

        <Section title="9. Cambios a esta política">
          <p>
            Podemos actualizar esta política ocasionalmente. Publicaremos
            cualquier cambio en esta página con su nueva fecha de actualización.
          </p>
        </Section>

        <Section title="10. Contacto">
          <p>
            Si tienes preguntas sobre esta política, escríbenos a{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </Section>
      </Card>
    </main>
  );
}
