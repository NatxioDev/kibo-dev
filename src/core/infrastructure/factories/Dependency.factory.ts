import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountRepository } from "@/features/accounts/domain/Account.repository";
import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import { SupabaseAuthRepository } from "@/features/auth/infrastructure/supabase/SupabaseAuth.repository";
import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type { DashboardRepository } from "@/features/dashboard/domain/Dashboard.repository";
import type { FeedbackRepository } from "@/features/feedback/domain/Feedback.repository";
import type { FriendshipRepository } from "@/features/friends/domain/Friendship.repository";
import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import type { ProfileRepository } from "@/features/profile/domain/Profile.repository";
import type { ReportesRepository } from "@/features/reportes/domain/Reportes.repository";
import type { SplitRepository } from "@/features/splits/domain/Split.repository";
import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";

// Dependencias disponibles en el servidor
export type AppDependencies = {
  authRepository: AuthRepository;
  transactionRepository: TransactionRepository;
  accountRepository: AccountRepository;
  categoryRepository: CategoryRepository;
  paymentMethodRepository: PaymentMethodRepository;
  dashboardRepository: DashboardRepository;
  reportesRepository: ReportesRepository;
  feedbackRepository: FeedbackRepository;
  profileRepository: ProfileRepository;
  friendshipRepository: FriendshipRepository;
  splitRepository: SplitRepository;
};

// Dependencias disponibles en el cliente (solo auth, el resto es server-only)
export type ClientDependencies = Pick<AppDependencies, "authRepository">;

export class DependencyFactory {
  static createClientDependencies(
    supabase: SupabaseClient,
  ): ClientDependencies {
    return {
      authRepository: new SupabaseAuthRepository(supabase),
    };
  }
}
