import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? "usuario";

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-stretch gap-8">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-50">
          Kibo
        </h1>
        <p className="text-center text-base text-zinc-400">
          Bienvenido, {email}
        </p>
        <LogoutButton />
      </div>
    </main>
  );
}
