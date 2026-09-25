import { DependencyFactory } from "@/core/infrastructure/factories/Dependency.factory";
import { createClient } from "@/lib/supabase/server";

export async function createServerDependencies() {
  const supabase = await createClient();
  return DependencyFactory.createFromSupabase(supabase);
}
