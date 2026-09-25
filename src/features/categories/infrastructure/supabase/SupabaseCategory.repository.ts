import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import { mapCategoryError } from "@/features/categories/infrastructure/supabase/mapCategoryError";
import type {
  Category,
  ServiceResult,
  TransactionType,
} from "@/features/transactions/domain/models";

export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(): Promise<ServiceResult<Category[]>> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapCategoryError(error) };
    }

    return { success: true, data: (data ?? []) as Category[] };
  }

  async listActiveByType(
    type: TransactionType,
  ): Promise<ServiceResult<Category[]>> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .eq("type", type)
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapCategoryError(error) };
    }

    return { success: true, data: (data ?? []) as Category[] };
  }

  async getById(id: string): Promise<ServiceResult<Category>> {
    const { data, error } = await this.supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapCategoryError(error) };
    }

    if (!data) {
      return { success: false, error: "Categoría no encontrada." };
    }

    return { success: true, data: data as Category };
  }

  async create(
    values: CategoryFormValues,
  ): Promise<ServiceResult<Category>> {
    const {
      data: { user },
      error: userError,
    } = await this.supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Debes iniciar sesión para crear una categoría.",
      };
    }

    const { data, error } = await this.supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: values.name,
        icon: values.icon,
        type: values.type,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapCategoryError(error) };
    }

    return { success: true, data: data as Category };
  }

  async update(
    id: string,
    values: CategoryFormValues,
  ): Promise<ServiceResult<Category>> {
    const { data, error } = await this.supabase
      .from("categories")
      .update({
        name: values.name,
        icon: values.icon,
        type: values.type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapCategoryError(error) };
    }

    return { success: true, data: data as Category };
  }

  async setActive(
    id: string,
    isActive: boolean,
  ): Promise<ServiceResult<Category>> {
    const { data, error } = await this.supabase
      .from("categories")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: mapCategoryError(error) };
    }

    return { success: true, data: data as Category };
  }
}
