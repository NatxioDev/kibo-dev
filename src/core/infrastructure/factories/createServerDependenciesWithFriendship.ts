import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseFriendshipRepository } from "@/features/friends/infrastructure/supabase/SupabaseFriendship.repository";
import { DependencyFactory } from "./Dependency.factory";
import type { AppDependencies } from "./Dependency.factory";

/**
 * Extiende las dependencias base con el repositorio de amigos (server-only).
 * Se usa internamente en createServerDependencies.
 */
export function createServerDependenciesWithFriendship(
  supabase: SupabaseClient,
): AppDependencies {
  const clientDeps = DependencyFactory.createClientDependencies(supabase);

  return {
    ...clientDeps,
    friendshipRepository: new SupabaseFriendshipRepository(supabase),
  };
}
