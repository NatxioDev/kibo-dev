import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryRepository } from "@/features/categories/domain/Category.repository";
import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import { mapCategoryError } from "@/features/categories/infrastructure/supabase/mapCategoryError";
import type { ServiceResult } from "@/core/domain/ServiceResult";
import type {
  Category,
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
    const [categoriesResult, usageResult] = await Promise.all([
      this.supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .eq("type", type)
        .order("name", { ascending: true }),
      this.supabase
        .from("transactions")
        .select("category_id")
        .eq("type", type)
        .not("category_id", "is", null),
    ]);

    if (categoriesResult.error) {
      return { success: false, error: mapCategoryError(categoriesResult.error) };
    }

    const categories = (categoriesResult.data ?? []) as Category[];
    // Si el conteo falla, devolvemos el orden alfabético: el formulario sigue usable.
    if (usageResult.error) return { success: true, data: categories };

    // shortcut: cuenta en JS sobre una columna; si el volumen crece, mover a una vista o RPC.
    const usage = new Map<string, number>();
    for (const row of usageResult.data ?? []) {
      const id = row.category_id as string;
      usage.set(id, (usage.get(id) ?? 0) + 1);
    }

    const byUsage = [...categories].sort(
      (a, b) =>
        (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0) ||
        a.name.localeCompare(b.name, "es"),
    );

    return { success: true, data: byUsage };
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
