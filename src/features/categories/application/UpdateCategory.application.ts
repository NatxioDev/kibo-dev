import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import type {
  Category,
  ServiceResult,
} from "@/features/transactions/domain/models";

export class UpdateCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(
    id: string,
    values: CategoryFormValues,
  ): Promise<ServiceResult<Category>> {
    return this.categoryRepository.update(id, values);
  }
}
