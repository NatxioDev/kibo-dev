import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type {
  Category,
  ServiceResult,
  TransactionType,
} from "@/features/transactions/domain/models";

export class ListActiveCategoriesByType {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(type: TransactionType): Promise<ServiceResult<Category[]>> {
    return this.categoryRepository.listActiveByType(type);
  }
}
