import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type {
  Category,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class SetCategoryActive {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResult<Category>> {
    return this.categoryRepository.setActive(id, isActive);
  }
}
