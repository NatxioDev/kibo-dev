import { createClient } from "@/lib/supabase/server";
import { createServerDependenciesWithFriendship } from "./createServerDependenciesWithFriendship";

export async function createServerDependencies() {
  const supabase = await createClient();
  return createServerDependenciesWithFriendship(supabase);
}
