import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type {
  Category,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class GetCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(id: string): Promise<ServiceResult<Category>> {
    return this.categoryRepository.getById(id);
  }
}
