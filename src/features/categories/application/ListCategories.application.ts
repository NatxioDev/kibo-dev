import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Category,
} from "@/features/transactions/domain/models";

export class ListCategories {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(): Promise<ServiceResult<Category[]>> {
    return this.categoryRepository.list();
  }
}
