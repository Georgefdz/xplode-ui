import {
  createContext,
  forwardRef,
  Fragment,
  useContext,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
  type Ref,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "../../utils/cn";
import { focusRingClasses } from "../../utils/focusRing";
import {
  findColumn,
  moveItem,
  type KanbanColumn,
  type KanbanItemBase,
} from "./Kanban.utils";

export type { KanbanColumn, KanbanItemBase } from "./Kanban.utils";

const SNAP_TRANSITION =
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 [transition-timing-function:var(--ease-snap)]";

const composeRefs =
  <T,>(...refs: Array<Ref<T> | undefined>) =>
  (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as MutableRefObject<T | null>).current = node;
    }
  };

/* -------------------------------------------------------------------------- */
/* Context                                                                     */
/* -------------------------------------------------------------------------- */

type KanbanContextValue = {
  columns: KanbanColumn[];
  data: KanbanItemBase[];
  activeId: string | null;
};

const KanbanContext = createContext<KanbanContextValue | null>(null);

const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error("Kanban components must be used within a <KanbanProvider>.");
  }
  return context;
};

/* -------------------------------------------------------------------------- */
/* KanbanProvider                                                              */
/* -------------------------------------------------------------------------- */

export type KanbanProviderProps<T extends KanbanItemBase> = Omit<
  ComponentProps<"div">,
  "children" | "onDragStart" | "onDragOver" | "onDragEnd"
> & {
  columns: KanbanColumn[];
  data: T[];
  /** Called with the next array whenever a drag reorders or moves an item. */
  onDataChange?: (data: T[]) => void;
  /** Render the board for a single column. Called once per column. */
  children: (column: KanbanColumn) => ReactNode;
  /** Render the floating card shown while dragging. */
  renderOverlay?: (item: T) => ReactNode;
  /** Forwarded dnd-kit drag callbacks, invoked after internal handling. */
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
};

export function KanbanProvider<T extends KanbanItemBase>({
  columns,
  data,
  onDataChange,
  children,
  renderOverlay,
  onDragStart,
  onDragOver,
  onDragEnd,
  className,
  ...props
}: KanbanProviderProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    onDragStart?.(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over) {
      const activeColumn = findColumn(data, columns, String(active.id));
      const overColumn = findColumn(data, columns, String(over.id));
      if (activeColumn && overColumn && activeColumn !== overColumn) {
        const next = moveItem(data, String(active.id), String(over.id), columns);
        if (next !== data) onDataChange?.(next);
      }
    }
    onDragOver?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over) {
      const next = moveItem(data, String(active.id), String(over.id), columns);
      if (next !== data) onDataChange?.(next);
    }
    onDragEnd?.(event);
  };

  const activeItem = activeId
    ? (data.find((item) => item.id === activeId) ?? null)
    : null;

  return (
    <KanbanContext.Provider value={{ columns, data, activeId }}>
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          data-slot="kanban"
          className={cn("flex gap-4 overflow-x-auto p-1 font-sans", className)}
          {...props}
        >
          {columns.map((column) => (
            <Fragment key={column.id}>{children(column)}</Fragment>
          ))}
        </div>
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeItem
            ? (renderOverlay?.(activeItem) ?? (
                <KanbanCard
                  id={activeItem.id}
                  column={activeItem.column}
                  asOverlay
                />
              ))
            : null}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* KanbanBoard (a single droppable column)                                     */
/* -------------------------------------------------------------------------- */

export type KanbanBoardProps = ComponentProps<"div"> & {
  /** Column id — must match the `id` of the column being rendered. */
  id: string;
};

export const KanbanBoard = forwardRef<HTMLDivElement, KanbanBoardProps>(
  ({ id, className, children, ...props }, ref) => {
    const { setNodeRef, isOver } = useDroppable({
      id,
      data: { type: "column" },
    });
    return (
      <div
        ref={composeRefs(ref, setNodeRef)}
        data-slot="kanban-board"
        data-over={isOver || undefined}
        className={cn(
          "flex w-72 shrink-0 flex-col gap-3 rounded-lg bg-muted/40 p-3 text-foreground",
          "transition-[box-shadow] duration-150 [transition-timing-function:var(--ease-snap)]",
          "data-[over=true]:ring-2 data-[over=true]:ring-ring/50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
KanbanBoard.displayName = "KanbanBoard";

/* -------------------------------------------------------------------------- */
/* KanbanHeader                                                                */
/* -------------------------------------------------------------------------- */

export type KanbanHeaderProps = ComponentProps<"div"> & {
  /** Column title. Ignored when `children` is provided. */
  name?: string;
  /** Tailwind background class for the leading dot, e.g. `"bg-punch"`. */
  color?: string;
  /** Item count shown in the badge. */
  count?: number;
  /** Trailing actions (e.g. add / menu buttons). */
  actions?: ReactNode;
};

export const KanbanHeader = forwardRef<HTMLDivElement, KanbanHeaderProps>(
  ({ name, color, count, actions, className, children, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="kanban-header"
      className={cn(
        "flex items-center justify-between gap-2 px-1",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn("size-2 rounded-full", color ?? "bg-muted-foreground")}
            />
            <span className="text-sm font-semibold text-foreground">{name}</span>
            {count !== undefined && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                {count}
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-0.5">{actions}</div>}
        </>
      )}
    </div>
  )
);
KanbanHeader.displayName = "KanbanHeader";

/* -------------------------------------------------------------------------- */
/* KanbanCards (SortableContext + maps the column's items)                     */
/* -------------------------------------------------------------------------- */

export type KanbanCardsProps<T extends KanbanItemBase> = Omit<
  ComponentProps<"div">,
  "children"
> & {
  /** Column id whose items should be rendered. */
  id: string;
  /** Render a single item. Called for every item in this column. */
  children: (item: T, index: number) => ReactNode;
  /** Placeholder shown when the column has no items. */
  emptyState?: ReactNode;
};

export function KanbanCards<T extends KanbanItemBase>({
  id,
  children,
  emptyState,
  className,
  ...props
}: KanbanCardsProps<T>) {
  const { data } = useKanban();
  const items = (data as T[]).filter((item) => item.column === id);

  return (
    <SortableContext
      items={items.map((item) => item.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        data-slot="kanban-cards"
        className={cn("flex flex-1 flex-col gap-3", className)}
        {...props}
      >
        {items.map((item, index) => (
          <Fragment key={item.id}>{children(item, index)}</Fragment>
        ))}
        {items.length === 0 &&
          (emptyState ?? (
            <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
              Drop tasks here
            </div>
          ))}
      </div>
    </SortableContext>
  );
}

/* -------------------------------------------------------------------------- */
/* KanbanCard (sortable item)                                                  */
/* -------------------------------------------------------------------------- */

export const kanbanCardVariants = cva(
  [
    "group/kanban-card relative flex flex-col gap-3 rounded-lg",
    "border border-border bg-card p-3 text-card-foreground shadow-sm",
    "outline-none",
    SNAP_TRANSITION,
    focusRingClasses,
    "data-[dragging=true]:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "cursor-grab",
        dragging: "rotate-3 cursor-grabbing shadow-lg",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type KanbanCardProps = ComponentProps<"div"> &
  VariantProps<typeof kanbanCardVariants> & {
    /** Item id — must match the rendered item's `id`. */
    id: string;
    /** Id of the column this card lives in. */
    column: string;
    /** Render as the static drag overlay (no sortable wiring). */
    asOverlay?: boolean;
  };

/** Standard lucide-style grip icon, inlined so the library carries no icon dep. */
const GripIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="9" cy="5" r="1.4" />
    <circle cx="15" cy="5" r="1.4" />
    <circle cx="9" cy="12" r="1.4" />
    <circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="19" r="1.4" />
    <circle cx="15" cy="19" r="1.4" />
  </svg>
);

/** Sortable inner element — only rendered for live (non-overlay) cards, so the
 * `useSortable` hook is always called unconditionally. */
const SortableCard = forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ id, column, variant, className, children, style, ...props }, ref) => {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
      useSortable({ id, data: { type: "card", column } });

    const dragStyle: CSSProperties = {
      ...style,
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={composeRefs(ref, setNodeRef)}
        data-slot="kanban-card"
        data-dragging={isDragging || undefined}
        style={dragStyle}
        className={cn(kanbanCardVariants({ variant }), className)}
        {...attributes}
        {...listeners}
        {...props}
      >
        {children}
        <GripIcon className="absolute top-2 right-2 size-4 text-muted-foreground opacity-0 transition-opacity group-hover/kanban-card:opacity-100" />
      </div>
    );
  }
);
SortableCard.displayName = "SortableCard";

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ id, column, asOverlay = false, variant, className, children, ...props }, ref) => {
    if (!asOverlay) {
      return (
        <SortableCard
          ref={ref}
          id={id}
          column={column}
          variant={variant}
          className={className}
          {...props}
        >
          {children}
        </SortableCard>
      );
    }

    // Static drag overlay — no sortable wiring, no grip affordance. `id`/`column`
    // are intentionally dropped so they don't leak onto the DOM node.
    return (
      <div
        ref={ref}
        data-slot="kanban-card"
        className={cn(
          kanbanCardVariants({ variant: variant ?? "dragging" }),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
KanbanCard.displayName = "KanbanCard";

/* -------------------------------------------------------------------------- */
/* KanbanCardFooter (presentational helper)                                    */
/* -------------------------------------------------------------------------- */

export const KanbanCardFooter = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="kanban-card-footer"
      className={cn(
        "flex items-center justify-between gap-2 text-xs text-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
);
KanbanCardFooter.displayName = "KanbanCardFooter";
