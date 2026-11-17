import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  TERMS_CONTACT_EMAIL,
  TERMS_EFFECTIVE_DATE,
  TERMS_INTRO,
  TERMS_SECTIONS,
} from "@/app/terms/termsCopy";

export const metadata: Metadata = {
  title: "Términos y condiciones · Kibo",
  description: "Qué es Kibo, qué registra y qué queda fuera del servicio.",
};

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-8 flex-col gap-3">
      <h2 className="font-display text-xl font-extrabold tracking-[-0.03em] text-balance text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-7 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(4rem,env(safe-area-inset-bottom))]">
      <PageHeader
        back={{ href: "/", label: "Kibo" }}
        title="Términos y condiciones"
        description={`Vigentes desde el ${TERMS_EFFECTIVE_DATE}`}
      />

      <Card className="flex flex-col gap-8 px-6 py-7 text-[0.9375rem] leading-relaxed text-pretty text-foreground/85 sm:px-8 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-2 [&_a:hover]:underline">
        {TERMS_INTRO.map((paragraph) => (
          <p key={paragraph}>{linkify(paragraph)}</p>
        ))}

        {TERMS_SECTIONS.map((section) => (
          <Section key={section.title} id={section.id} title={section.title}>
            {section.blocks.map((block) =>
              block.type === "p" ? (
                <p key={block.text}>{linkify(block.text)}</p>
              ) : (
                <ul key={block.items.join("|")} className="list-disc space-y-1 pl-5">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ),
            )}
          </Section>
        ))}
      </Card>
    </main>
  );
}

function linkify(text: string): ReactNode {
  const markers = ["política de privacidad", TERMS_CONTACT_EMAIL];
  const pattern = new RegExp(`(${markers.map(escapeRegExp).join("|")})`, "g");
  const parts = text.split(pattern);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (part === "política de privacidad") {
      return (
        <Link key={`${part}-${index}`} href="/privacy">
          {part}
        </Link>
      );
    }
    if (part === TERMS_CONTACT_EMAIL) {
      return (
        <a key={`${part}-${index}`} href={`mailto:${TERMS_CONTACT_EMAIL}`}>
          {part}
        </a>
      );
    }
    return part;
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
