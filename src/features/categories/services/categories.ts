import { createClient } from "@/lib/supabase/client";
import type { CategoryFormValues } from "@/features/categories/schemas/categorySchema";
import type {
  Category,
  ServiceResult,
} from "@/features/transactions/types";
import { mapCategoryError } from "./mapCategoryError";

export async function createCategory(
  values: CategoryFormValues,
): Promise<ServiceResult<Category>> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Debes iniciar sesión para crear una categoría.",
    };
  }

  const { data, error } = await supabase
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

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<ServiceResult<Category>> {
  const supabase = createClient();

  const { data, error } = await supabase
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

export async function setCategoryActive(
  id: string,
  isActive: boolean,
): Promise<ServiceResult<Category>> {
  const supabase = createClient();

  const { data, error } = await supabase
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
