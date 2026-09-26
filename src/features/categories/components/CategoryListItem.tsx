"use client";

import { useState } from "react";
import { ManagedListItem } from "@/components/ManagedListItem";
import { DeactivateCategoryDialog } from "@/features/categories/components/DeactivateCategoryDialog";
import { useToggleCategoryActive } from "@/features/categories/hooks/useToggleCategoryActive";
import type { Category } from "@/features/transactions/types";

type CategoryListItemProps = {
  category: Category;
  iconBackground: string;
};

export function CategoryListItem({
  category,
  iconBackground,
}: CategoryListItemProps) {
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const { toggle, error, loading } = useToggleCategoryActive();

  return (
    <>
      <ManagedListItem
        icon={category.icon?.trim() || "📦"}
        iconBackground={iconBackground}
        name={category.name}
        href={`/settings/categories/${category.id}/edit`}
        isActive={category.is_active}
        inactiveLabel="Desactivada"
        loading={loading}
        error={deactivateOpen ? null : error}
        onActivate={() => toggle(category.id, true)}
        onRequestDeactivate={() => setDeactivateOpen(true)}
      />
      <DeactivateCategoryDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        categoryId={category.id}
        categoryName={category.name}
      />
    </>
  );
}
