import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListGroup } from "@/components/ui/ListGroup";
import {
  categoryColorOf,
  categoryColors,
  categoryTint,
} from "@/features/categories/categoryColor";
import { CategoryListItem } from "@/features/categories/components/CategoryListItem";
import type { Category } from "@/features/transactions/types";

type CategoryListProps = {
  categories: Category[];
};

function byActiveFirst(a: Category, b: Category) {
  return Number(b.is_active) - Number(a.is_active);
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <Reveal>
        <EmptyState
          icon="🏷️"
          title="Sin categorías"
          description="Crea categorías para saber en qué se va tu dinero."
          action={<Button href="/settings/categories/new">+ Nueva categoría</Button>}
        />
      </Reveal>
    );
  }

  const colors = categoryColors(categories);
  const groups = [
    { title: "Gastos", type: "EXPENSE", empty: "Sin categorías de gasto." },
    { title: "Ingresos", type: "INCOME", empty: "Sin categorías de ingreso." },
  ] as const;

  return (
    <>
      {groups.map((group) => {
        const items = categories
          .filter((category) => category.type === group.type)
          .sort(byActiveFirst);
        return (
          <Reveal key={group.type}>
            <ListGroup title={group.title}>
              {items.length === 0 ? (
                <li className="px-4 py-4 text-sm text-muted-foreground">
                  {group.empty}
                </li>
              ) : (
                items.map((category) => (
                  <CategoryListItem
                    key={category.id}
                    category={category}
                    iconBackground={categoryTint(
                      categoryColorOf(colors, category.id),
                    )}
                  />
                ))
              )}
            </ListGroup>
          </Reveal>
        );
      })}
      <Reveal>
        <p className="px-4 text-sm text-pretty text-muted-foreground">
          Toca una categoría para editarla. Las desactivadas no aparecen al
          registrar transacciones.
        </p>
      </Reveal>
    </>
  );
}
