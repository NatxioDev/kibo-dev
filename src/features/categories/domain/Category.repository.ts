import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Category,
  TransactionType,
} from "@/features/transactions/domain/models";

export interface CategoryRepository {
  list(): Promise<ServiceResult<Category[]>>;
  listActiveByType(type: TransactionType): Promise<ServiceResult<Category[]>>;
  getById(id: string): Promise<ServiceResult<Category>>;
  create(values: CategoryFormValues): Promise<ServiceResult<Category>>;
  update(
    id: string,
    values: CategoryFormValues,
  ): Promise<ServiceResult<Category>>;
  setActive(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResult<Category>>;
}
