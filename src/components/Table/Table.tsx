import {
  forwardRef,
  type ComponentProps,
  type MouseEventHandler,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { focusRingClasses } from "../../utils/focusRing";

/** Sort state of a column header — mirrors TanStack's `column.getIsSorted()`. */
export type SortDirection = false | "asc" | "desc";

/* -------------------------------------------------------------------------- */
/* Table (scroll container + <table>)                                          */
/* -------------------------------------------------------------------------- */

export const tableVariants = cva(
  "w-full caption-bottom border-collapse font-sans text-sm text-foreground",
  {
    variants: {
      variant: {
        default: "",
        striped: "[&_tbody_tr:nth-child(even)]:bg-muted/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export type TableProps = ComponentProps<"table"> &
  VariantProps<typeof tableVariants> & {
    /** Class applied to the horizontal scroll container that wraps the table. */
    containerClassName?: string;
  };

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, containerClassName, ...props }, ref) => (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        ref={ref}
        data-slot="table"
        data-variant={variant ?? "default"}
        className={cn(tableVariants({ variant }), className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<"thead">
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    data-slot="table-header"
    className={cn("[&_tr]:border-b [&_tr]:border-border", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<"tbody">
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    data-slot="table-body"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  ComponentProps<"tfoot">
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    data-slot="table-footer"
    className={cn(
      "border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

/* -------------------------------------------------------------------------- */
/* Row                                                                         */
/* -------------------------------------------------------------------------- */

const SNAP_TRANSITION =
  "transition-[background-color,color] duration-150 [transition-timing-function:var(--ease-snap)]";

export const TableRow = forwardRef<HTMLTableRowElement, ComponentProps<"tr">>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn(
        "border-b border-border",
        SNAP_TRANSITION,
        "hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

/* -------------------------------------------------------------------------- */
/* Head cell (with optional sort affordance)                                   */
/* -------------------------------------------------------------------------- */

/** Up/down chevron pair; the active direction is emphasised. Inlined so the
 * library carries no icon dependency (matches the rest of xplode-ui). */
function SortIcon({ direction = false }: { direction?: SortDirection }) {
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
      className="size-3.5 shrink-0 text-muted-foreground/70"
    >
      <path
        d="M8 10l4-4 4 4"
        className={cn(
          "transition-opacity duration-150",
          direction === "asc" ? "text-foreground opacity-100" : "opacity-40"
        )}
      />
      <path
        d="M16 14l-4 4-4-4"
        className={cn(
          "transition-opacity duration-150",
          direction === "desc" ? "text-foreground opacity-100" : "opacity-40"
        )}
      />
    </svg>
  );
}

export type TableHeadProps = ComponentProps<"th"> & {
  /** Render the header as an interactive sort toggle. */
  sortable?: boolean;
  /** Current sort direction; drives the indicator and `aria-sort`. */
  sortDirection?: SortDirection;
};

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  (
    { className, sortable = false, sortDirection = false, children, onClick, ...props },
    ref
  ) => (
    <th
      ref={ref}
      data-slot="table-head"
      aria-sort={
        !sortable
          ? undefined
          : sortDirection === "asc"
            ? "ascending"
            : sortDirection === "desc"
              ? "descending"
              : "none"
      }
      className={cn(
        "h-10 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:w-px",
        className
      )}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          data-slot="table-sort-button"
          onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
          className={cn(
            "-ml-1 inline-flex select-none items-center gap-1.5 rounded px-1 py-0.5",
            "text-muted-foreground hover:text-foreground",
            SNAP_TRANSITION,
            focusRingClasses
          )}
        >
          {children}
          <SortIcon direction={sortDirection} />
        </button>
      ) : (
        children
      )}
    </th>
  )
);
TableHead.displayName = "TableHead";

/* -------------------------------------------------------------------------- */
/* Data cell                                                                   */
/* -------------------------------------------------------------------------- */

export const TableCell = forwardRef<HTMLTableCellElement, ComponentProps<"td">>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

/* -------------------------------------------------------------------------- */
/* Caption                                                                     */
/* -------------------------------------------------------------------------- */

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  ComponentProps<"caption">
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    data-slot="table-caption"
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

/* -------------------------------------------------------------------------- */
/* Empty state (full-width placeholder row)                                    */
/* -------------------------------------------------------------------------- */

export type TableEmptyProps = ComponentProps<"td">;

export const TableEmpty = forwardRef<HTMLTableCellElement, TableEmptyProps>(
  ({ className, children, ...props }, ref) => (
    <tr data-slot="table-empty-row">
      <td
        ref={ref}
        data-slot="table-empty"
        className={cn(
          "h-24 p-3 text-center text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        {children ?? "No results."}
      </td>
    </tr>
  )
);
TableEmpty.displayName = "TableEmpty";
