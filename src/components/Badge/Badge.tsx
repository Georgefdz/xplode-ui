import { forwardRef, type ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { focusRingClasses } from "../../utils/focusRing";

const SNAP_TRANSITION =
  "transition-[color,background-color,border-color,box-shadow] duration-150 [transition-timing-function:var(--ease-snap)]";

export const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1",
    "overflow-hidden rounded-full border border-transparent px-2 py-0.5",
    "font-sans text-xs font-medium whitespace-nowrap",
    "outline-none",
    SNAP_TRANSITION,
    focusRingClasses,
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        punch: "bg-punch text-punch-foreground [a&]:hover:bg-punch/90",
        muted: "bg-muted text-muted-foreground [a&]:hover:bg-muted/80",
        "destructive-subtle":
          "bg-destructive/10 text-destructive [a&]:hover:bg-destructive/15",
        "punch-subtle": "bg-punch/20 text-foreground [a&]:hover:bg-punch/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  };

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
        data-slot="badge"
        data-variant={variant}
        className={cn(badgeVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
