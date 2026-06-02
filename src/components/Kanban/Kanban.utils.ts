import { arrayMove } from "@dnd-kit/sortable";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type KanbanColumn = {
  id: string;
  name: string;
  color?: string;
};

export type KanbanItemBase = {
  id: string;
  column: string;
};

/* -------------------------------------------------------------------------- */
/* Pure helpers (drag math — unit-testable, no React)                          */
/* -------------------------------------------------------------------------- */

/**
 * Resolve an over/active id to a column id. `id` may be a card id (look up its
 * `column`) or a column's own droppable id (returned as-is).
 */
export const findColumn = <T extends KanbanItemBase>(
  data: T[],
  columns: KanbanColumn[],
  id: string
): string | null => {
  if (columns.some((column) => column.id === id)) return id;
  return data.find((item) => item.id === id)?.column ?? null;
};

/**
 * Compute the next `data` array after dragging `activeId` over `overId`.
 *
 * Ordering is encoded purely by array position within each column, so the
 * result is regrouped in `columns` order. Returns the original array reference
 * when the move is a no-op so callers can skip needless `onDataChange` calls.
 */
export const moveItem = <T extends KanbanItemBase>(
  data: T[],
  activeId: string,
  overId: string,
  columns: KanbanColumn[]
): T[] => {
  if (activeId === overId) return data;

  const activeColumn = findColumn(data, columns, activeId);
  const overColumn = findColumn(data, columns, overId);
  if (!activeColumn || !overColumn) return data;
  if (!data.some((item) => item.id === activeId)) return data;

  const groups: Record<string, string[]> = {};
  for (const item of data) (groups[item.column] ??= []).push(item.id);
  for (const column of columns) groups[column.id] ??= [];

  if (activeColumn === overColumn) {
    const ids = groups[activeColumn];
    const oldIndex = ids.indexOf(activeId);
    const newIndex =
      overId === overColumn ? ids.length - 1 : ids.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
      return data;
    groups[activeColumn] = arrayMove(ids, oldIndex, newIndex);
  } else {
    groups[activeColumn] = groups[activeColumn].filter((id) => id !== activeId);
    const overIds = groups[overColumn];
    const overIndex =
      overId === overColumn ? overIds.length : overIds.indexOf(overId);
    overIds.splice(overIndex === -1 ? overIds.length : overIndex, 0, activeId);
  }

  const byId = new Map(data.map((item) => [item.id, item]));
  const known = new Set(columns.map((column) => column.id));
  const order = [
    ...columns.map((column) => column.id),
    ...Object.keys(groups).filter((id) => !known.has(id)),
  ];

  const result: T[] = [];
  for (const columnId of order) {
    for (const id of groups[columnId] ?? []) {
      const item = byId.get(id);
      if (item)
        result.push(
          item.column === columnId ? item : { ...item, column: columnId }
        );
    }
  }
  return result;
};
