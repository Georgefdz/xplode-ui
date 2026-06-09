import {
  Fragment,
  useMemo,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import { focusRingClasses } from "../../utils/focusRing";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import {
  createDataTableColumnHelper,
  flexRender,
  useDataTable,
  type DataTableColumnDef,
  type DataTableFeatures,
  type RowData,
  type Table as TableInstance,
} from "./useDataTable";

/** Chevron used by the column-visibility menu trigger. Inlined — no icon dep. */
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export type DataTableProps<TData extends RowData, TValue = unknown> = {
  /** Column definitions — build them with `createDataTableColumnHelper<TData>()`. */
  columns: DataTableColumnDef<TData, TValue>[];
  /** The rows to display. Memoize this for best performance. */
  data: TData[];
  /** Visual variant forwarded to the underlying `<table>`. */
  variant?: "default" | "striped";
  /**
   * Stable row id. Strongly recommended when row selection is enabled so a
   * selection survives sorting and pagination (defaults to the row index).
   */
  getRowId?: (row: TData, index: number) => string;
  /** Allow clicking sortable column headers to sort. Default: `true`. */
  enableSorting?: boolean;
  /** Enable client-side pagination and the page controls. Default: `false`. */
  enablePagination?: boolean;
  /** Rows per page when pagination is enabled. Default: `10`. */
  pageSize?: number;
  /** Prepend a row-selection checkbox column. Default: `false`. */
  enableRowSelection?: boolean;
  /** Show the column-visibility toggle menu. Default: `false`. */
  enableColumnVisibility?: boolean;
  /**
   * Called with the row's data when a row is clicked (or activated with
   * Enter/Space). Clicks that originate from an interactive cell — the
   * selection checkbox, a button, link or input — are ignored so they keep
   * their own behaviour. Setting this makes rows focusable and pointer-cursored.
   *
   * Ignored when `renderExpandedRow` is set — expansion takes over the click.
   */
  onRowClick?: (row: TData) => void;
  /**
   * Render an expandable detail panel for a row. When provided, clicking a row
   * (or pressing Enter/Space) toggles an accordion-style panel open or closed
   * directly beneath it; clicks on interactive cells are ignored. Restrict
   * which rows can expand with `getRowCanExpand`.
   */
  renderExpandedRow?: (row: TData) => ReactNode;
  /**
   * Decide whether a given row can expand. Only consulted when
   * `renderExpandedRow` is set. Default: every row can expand.
   */
  getRowCanExpand?: (row: TData) => boolean;
  /** Optional caption rendered beneath the table. */
  caption?: ReactNode;
  /** Content shown when there are no rows. */
  emptyMessage?: ReactNode;
  /** Class for the `<table>` element. */
  className?: string;
  /** Class for the scroll container wrapping the table. */
  containerClassName?: string;
};

/* -------------------------------------------------------------------------- */
/* Column-visibility menu                                                      */
/* -------------------------------------------------------------------------- */

function columnLabel(columnDef: { header?: unknown }, fallback: string) {
  return typeof columnDef.header === "string" ? columnDef.header : fallback;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

/** True when a click landed on (or inside) an interactive cell element — so a
 * row-click handler can defer to that element's own behaviour. */
function isInteractiveTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest(
      'button, a, input, select, textarea, label, [role="checkbox"], [data-slot="checkbox"]'
    ) !== null
  );
}

function ColumnVisibilityMenu<TData extends RowData>({
  table,
}: {
  table: TableInstance<DataTableFeatures, TData>;
}) {
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  return (
    <details data-slot="table-columns-menu" className="group/menu relative">
      <Button
        asChild
        variant="outline"
        size="sm"
        aria-label="Toggle columns"
      >
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          Columns
          <ChevronDown className="size-4 transition-transform group-open/menu:rotate-180" />
        </summary>
      </Button>
      <div
        role="group"
        aria-label="Toggle columns"
        className={cn(
          "absolute right-0 z-20 mt-1 min-w-44 rounded-md border border-border bg-card p-1 shadow-md",
          "text-card-foreground"
        )}
      >
        {hideableColumns.map((column) => (
          <label
            key={column.id}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm capitalize hover:bg-muted"
          >
            <Checkbox
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(value === true)}
            />
            {columnLabel(column.columnDef, column.id)}
          </label>
        ))}
      </div>
    </details>
  );
}

/* -------------------------------------------------------------------------- */
/* DataTable                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A controlled, headless-engine-backed data table built on **TanStack Table
 * v9**. It wires the chosen features (sorting, pagination, row selection,
 * column visibility) into the xplode-ui table primitives.
 *
 * For full control, skip this component and compose the primitives with the
 * exported `useDataTable` hook directly.
 */
export function DataTable<TData extends RowData, TValue = unknown>({
  columns,
  data,
  variant,
  getRowId,
  enableSorting = true,
  enablePagination = false,
  pageSize = 10,
  enableRowSelection = false,
  enableColumnVisibility = false,
  onRowClick,
  renderExpandedRow,
  getRowCanExpand,
  caption,
  emptyMessage = "No results.",
  className,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const tableColumns = useMemo<DataTableColumnDef<TData, unknown>[]>(() => {
    // Normalise the caller's per-column TValue to `unknown`; the table only
    // ever reads columns generically, and v9's hook fixes this generic.
    const baseColumns = columns as unknown as DataTableColumnDef<TData, unknown>[];
    if (!enableRowSelection) return baseColumns;
    const columnHelper = createDataTableColumnHelper<TData>();
    const selectionColumn = columnHelper.display({
      id: "__select__",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
                ? "indeterminate"
                : false
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(value === true)
          }
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(value === true)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    });
    return [selectionColumn, ...baseColumns];
  }, [columns, enableRowSelection]);

  const table = useDataTable<TData>({
    columns: tableColumns,
    data,
    getRowId,
    enableSorting,
    enableRowSelection,
    enableExpanding: renderExpandedRow ? true : undefined,
    getRowCanExpand: renderExpandedRow
      ? (row) => (getRowCanExpand ?? (() => true))(row.original)
      : undefined,
    initialState: {
      pagination: {
        pageIndex: 0,
        // When pagination is off, keep every row on one page — a fixed large
        // size (not `data.length`, which `initialState` would freeze at mount
        // and then truncate when data grows). This also makes the page-scoped
        // "select all" checkbox span the whole dataset.
        pageSize: enablePagination ? pageSize : Number.MAX_SAFE_INTEGER,
      },
    },
  });

  const rows = table.getRowModel().rows;
  const showToolbar = enableColumnVisibility || enableRowSelection;
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div data-slot="data-table" className="flex w-full flex-col gap-3 font-sans">
      {showToolbar && (
        <div className="flex items-center justify-between gap-2">
          {enableRowSelection && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {selectedCount} of {table.getRowCount()} row(s) selected
            </p>
          )}
          {enableColumnVisibility && (
            <div className="ml-auto">
              <ColumnVisibilityMenu table={table} />
            </div>
          )}
        </div>
      )}

      <Table
        variant={variant}
        className={className}
        containerClassName={containerClassName}
      >
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = enableSorting && header.column.getCanSort();
                const meta = header.column.columnDef.meta;
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    sortable={canSort}
                    sortDirection={canSort ? header.column.getIsSorted() : false}
                    onClick={
                      canSort ? header.column.getToggleSortingHandler() : undefined
                    }
                    className={cn(
                      meta?.align && alignClass[meta.align],
                      meta?.className
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => {
              // A row is expandable when a panel renderer is provided and the
              // engine allows this row to expand; otherwise it may still be a
              // plain `onRowClick` row. Either way it becomes a focusable,
              // pointer-cursored control with the same interaction guards.
              const isExpandable = Boolean(renderExpandedRow) && row.getCanExpand();
              const activate = isExpandable
                ? () => row.toggleExpanded()
                : onRowClick
                  ? () => onRowClick(row.original)
                  : undefined;
              const isExpanded = isExpandable && row.getIsExpanded();
              return (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    data-clickable={activate ? true : undefined}
                    tabIndex={activate ? 0 : undefined}
                    aria-expanded={isExpandable ? isExpanded : undefined}
                    className={
                      activate ? cn("cursor-pointer", focusRingClasses) : undefined
                    }
                    onClick={
                      activate
                        ? (event: MouseEvent<HTMLTableRowElement>) => {
                            if (!isInteractiveTarget(event.target)) {
                              activate();
                            }
                          }
                        : undefined
                    }
                    onKeyDown={
                      activate
                        ? (event: KeyboardEvent<HTMLTableRowElement>) => {
                            if (
                              event.target === event.currentTarget &&
                              (event.key === "Enter" || event.key === " ")
                            ) {
                              event.preventDefault();
                              activate();
                            }
                          }
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            meta?.align && alignClass[meta.align],
                            meta?.className
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {isExpandable && (
                    <TableRow
                      data-slot="table-detail-row"
                      data-state={isExpanded ? "open" : "closed"}
                      aria-hidden={!isExpanded}
                      className="border-0 hover:bg-transparent"
                    >
                      <TableCell
                        colSpan={table.getVisibleLeafColumns().length}
                        className="p-0"
                      >
                        {/* grid-rows 0fr→1fr animates open *and* close without a
                            measured height var; the inner overflow-hidden clips
                            the content while it collapses. */}
                        <div
                          data-state={isExpanded ? "open" : "closed"}
                          className={cn(
                            "grid grid-rows-[0fr] transition-[grid-template-rows] duration-200",
                            "[transition-timing-function:var(--ease-snap)]",
                            "data-[state=open]:grid-rows-[1fr]"
                          )}
                        >
                          <div className="overflow-hidden">
                            <div className="bg-muted/30 px-4 py-3">
                              {renderExpandedRow?.(row.original)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })
          ) : (
            <TableEmpty colSpan={table.getVisibleLeafColumns().length}>
              {emptyMessage}
            </TableEmpty>
          )}
        </TableBody>
      </Table>

      {enablePagination && (
        <div className="flex items-center justify-end gap-3">
          <span className="text-sm text-muted-foreground">
            Page {table.state.pagination.pageIndex + 1} of{" "}
            {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
