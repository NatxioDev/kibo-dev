import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import type {
  Category,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class CreateCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(values: CategoryFormValues): Promise<ServiceResult<Category>> {
    return this.categoryRepository.create(values);
  }
}
