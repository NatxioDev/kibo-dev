import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  ServiceResult,
} from "@/features/transactions/types";
import { mapCategoryError } from "./mapCategoryError";

export async function listCategories(): Promise<ServiceResult<Category[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return { success: false, error: mapCategoryError(error) };
  }

  return { success: true, data: (data ?? []) as Category[] };
}

export async function getCategory(
  id: string,
): Promise<ServiceResult<Category>> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
