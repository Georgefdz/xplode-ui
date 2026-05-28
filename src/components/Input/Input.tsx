import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { focusRingClasses } from "../../utils/focusRing";

const SNAP_TRANSITION =
  "transition-[color,background-color,border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-snap)]";

export type InputProps = ComponentProps<"input"> & {
  leadingSlot?: ReactNode;
  trailingSlot?: ReactNode;
};

const inputClasses = cn(
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1",
  "font-sans text-base shadow-xs",
  SNAP_TRANSITION,
  "outline-none",
  "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
  focusRingClasses,
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  "md:text-sm"
);

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leadingSlot, trailingSlot, ...props }, ref) => {
    if (!leadingSlot && !trailingSlot) {
      return (
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(inputClasses, className)}
          {...props}
        />
      );
    }

    return (
      <div
        data-slot="input-wrapper"
        className="group relative inline-flex w-full items-center [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      >
        {leadingSlot && (
          <span
            data-slot="input-leading"
            className="pointer-events-none absolute left-3 inline-flex text-muted-foreground"
          >
            {leadingSlot}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            inputClasses,
            leadingSlot && "pl-9",
            trailingSlot && "pr-9",
            className
          )}
          {...props}
        />
        {trailingSlot && (
          <span
            data-slot="input-trailing"
            className="absolute right-3 inline-flex text-muted-foreground"
          >
            {trailingSlot}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
