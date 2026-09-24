import Link from "next/link";
import { FeedbackForm } from "@/features/feedback/components/FeedbackForm";

export default function FeedbackSettingsPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col px-4 py-8">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header>
          <Link href="/settings" className="text-sm text-zinc-500 underline dark:text-zinc-400">
            Configuración
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Enviar feedback
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Reporta un bug, comparte una idea o déjanos un comentario.
          </p>
        </header>
        <FeedbackForm />
      </div>
    </main>
  );
}
