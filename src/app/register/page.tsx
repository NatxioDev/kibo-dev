import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col items-stretch gap-8">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-zinc-50">
          Kibo
        </h1>
        <RegisterForm />
      </div>
    </main>
  );
}
