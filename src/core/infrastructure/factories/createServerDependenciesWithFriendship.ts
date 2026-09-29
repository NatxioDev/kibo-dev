import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseAccountRepository } from "@/features/accounts/infrastructure/supabase/SupabaseAccount.repository";
import { SupabaseCategoryRepository } from "@/features/categories/infrastructure/supabase/SupabaseCategory.repository";
import { SupabaseDashboardRepository } from "@/features/dashboard/infrastructure/supabase/SupabaseDashboard.repository";
import { SupabaseFeedbackRepository } from "@/features/feedback/infrastructure/supabase/SupabaseFeedback.repository";
import { SupabaseFriendshipRepository } from "@/features/friends/infrastructure/supabase/SupabaseFriendship.repository";
import { SupabasePaymentMethodRepository } from "@/features/payment-methods/infrastructure/supabase/SupabasePaymentMethod.repository";
import { SupabaseProfileRepository } from "@/features/profile/infrastructure/supabase/SupabaseProfile.repository";
import { SupabaseSplitRepository } from "@/features/splits/infrastructure/supabase/SupabaseSplit.repository";
import { SupabaseTransactionRepository } from "@/features/transactions/infrastructure/supabase/SupabaseTransaction.repository";
import { DependencyFactory } from "./Dependency.factory";
import type { AppDependencies } from "./Dependency.factory";

/**
 * Crea todas las dependencias del servidor, incluyendo todos los repositorios
 * que requieren autenticación y lógica server-only.
 */
export function createServerDependenciesWithFriendship(
  supabase: SupabaseClient,
): AppDependencies {
  const clientDeps = DependencyFactory.createClientDependencies(supabase);

  return {
    ...clientDeps,
    transactionRepository: new SupabaseTransactionRepository(supabase),
    accountRepository: new SupabaseAccountRepository(supabase),
    categoryRepository: new SupabaseCategoryRepository(supabase),
    paymentMethodRepository: new SupabasePaymentMethodRepository(supabase),
    dashboardRepository: new SupabaseDashboardRepository(supabase),
    feedbackRepository: new SupabaseFeedbackRepository(supabase),
    profileRepository: new SupabaseProfileRepository(supabase),
    friendshipRepository: new SupabaseFriendshipRepository(supabase),
    splitRepository: new SupabaseSplitRepository(supabase),
  };
}
