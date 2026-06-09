import {
  columnVisibilityFeature,
  createExpandedRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  flexRender,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  type CellData,
  type ColumnDef,
  type RowData,
  type TableFeatures,
} from "@tanstack/react-table";

/**
 * Extend TanStack's column `meta` so a column can declare its text alignment
 * and an extra className. `DataTable` applies these to the matching `<th>`/
 * `<td>`. Augmenting `@tanstack/table-core` (where `ColumnMeta` is declared)
 * makes the fields type-safe on every column definition.
 */
declare module "@tanstack/table-core" {
  // The generic params must mirror TanStack's `ColumnMeta` for declaration
  // merging, even though this augmentation doesn't reference them.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    align?: "left" | "center" | "right";
    className?: string;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

/**
 * The feature set baked into every xplode-ui data table.
 *
 * v9 treats features as opt-in plugins, so registering them explicitly keeps
 * the bundle tree-shakable — we ship sorting, pagination, row selection,
 * column visibility and row expanding, and nothing else (no filtering,
 * grouping…).
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  rowExpandingFeature,
});

export type DataTableFeatures = typeof dataTableFeatures;

/**
 * Pre-configured table hook + column helper, created **once** via v9's
 * `createTableHook` — the table analogue of TanStack Form's `createFormHook`.
 *
 * Configuring the features and row models in a single place means consumers
 * (and the `DataTable` component below) call `useDataTable({ columns, data })`
 * without ever touching feature registration.
 */
const dataTableHook = createTableHook({
  features: dataTableFeatures,
  rowModels: {
    sortedRowModel: createSortedRowModel(sortFns),
    paginatedRowModel: createPaginatedRowModel(),
    expandedRowModel: createExpandedRowModel(),
  },
});

/** Pre-configured table hook — features and row models are already wired in. */
export const useDataTable = dataTableHook.useAppTable;

/**
 * Column helper pre-bound to the data-table feature set. Use it instead of the
 * raw `ColumnDef` type so you don't have to pass the feature generic yourself:
 *
 * ```ts
 * const columnHelper = createDataTableColumnHelper<Person>();
 * const columns = [columnHelper.accessor("name", { header: "Name" })];
 * ```
 */
export const createDataTableColumnHelper = dataTableHook.createAppColumnHelper;

/** A column definition typed against the data-table feature set. */
export type DataTableColumnDef<TData extends RowData, TValue = unknown> =
  ColumnDef<DataTableFeatures, TData, TValue>;

export { flexRender };
export type { RowData } from "@tanstack/react-table";
export type {
  CellContext,
  Column,
  ColumnDef,
  ColumnSort,
  ColumnVisibilityState,
  ExpandedState,
  HeaderContext,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Table,
  Updater,
} from "@tanstack/react-table";
