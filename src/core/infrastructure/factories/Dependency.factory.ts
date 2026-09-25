import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository } from "@/features/auth/domain/Auth.repository";
import { SupabaseAuthRepository } from "@/features/auth/infrastructure/supabase/SupabaseAuth.repository";
import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import { SupabaseCategoryRepository } from "@/features/categories/infrastructure/supabase/SupabaseCategory.repository";
import type { DashboardRepository } from "@/features/dashboard/domain/Dashboard.repository";
import { SupabaseDashboardRepository } from "@/features/dashboard/infrastructure/supabase/SupabaseDashboard.repository";
import type { FeedbackRepository } from "@/features/feedback/domain/Feedback.repository";
import { SupabaseFeedbackRepository } from "@/features/feedback/infrastructure/supabase/SupabaseFeedback.repository";
import type { PaymentMethodRepository } from "@/features/payment-methods/domain/PaymentMethod.repository";
import { SupabasePaymentMethodRepository } from "@/features/payment-methods/infrastructure/supabase/SupabasePaymentMethod.repository";
import type { TransactionRepository } from "@/features/transactions/domain/Transaction.repository";
import { SupabaseTransactionRepository } from "@/features/transactions/infrastructure/supabase/SupabaseTransaction.repository";

export type AppDependencies = {
  authRepository: AuthRepository;
  transactionRepository: TransactionRepository;
  categoryRepository: CategoryRepository;
  paymentMethodRepository: PaymentMethodRepository;
  dashboardRepository: DashboardRepository;
  feedbackRepository: FeedbackRepository;
};

export class DependencyFactory {
  static createFromSupabase(supabase: SupabaseClient): AppDependencies {
    return {
      authRepository: new SupabaseAuthRepository(supabase),
      transactionRepository: new SupabaseTransactionRepository(supabase),
      categoryRepository: new SupabaseCategoryRepository(supabase),
      paymentMethodRepository: new SupabasePaymentMethodRepository(supabase),
      dashboardRepository: new SupabaseDashboardRepository(supabase),
      feedbackRepository: new SupabaseFeedbackRepository(supabase),
    };
  }
}
