import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Category,
  TransactionType,
} from "@/features/transactions/domain/models";

export class ListActiveCategoriesByType {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(type: TransactionType): Promise<ServiceResult<Category[]>> {
    return this.categoryRepository.listActiveByType(type);
  }
}
