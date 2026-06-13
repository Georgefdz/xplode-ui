import {
  createContext,
  forwardRef,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const SNAP_TRANSITION =
  "transition-[background-color,border-color,color,box-shadow] duration-150 [transition-timing-function:var(--ease-snap)] motion-reduce:transition-none";

export type TimelineStatus = "completed" | "current" | "pending";

const STATUS_LABEL: Record<TimelineStatus, string> = {
  completed: "Completed",
  current: "In progress",
  pending: "Pending",
};

/**
 * Orientation + spacing flow down through context so sub-parts (marker,
 * connector, content) adapt their layout without prop-drilling. The shape is
 * intentionally extensible — a future `activeIndex` can join here to let
 * `useScrollProgress` drive item statuses without touching the public API.
 */
type TimelineContextValue = {
  orientation: "vertical" | "horizontal";
  spacing: "comfortable" | "dense";
};

const TimelineContext = createContext<TimelineContextValue>({
  orientation: "vertical",
  spacing: "comfortable",
});

const useTimelineContext = () => useContext(TimelineContext);

/* -------------------------------------------------------------------------- */
/*  Variants                                                                   */
/* -------------------------------------------------------------------------- */

export const timelineVariants = cva("relative flex", {
  variants: {
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
    // Actual rhythm lives on TimelineContent (context-aware); these keep the
    // prop in the type surface and reflect onto the root for styling hooks.
    spacing: {
      comfortable: "",
      dense: "",
    },
  },
  defaultVariants: { orientation: "vertical", spacing: "comfortable" },
});

export const timelineMarkerVariants = cva(
  [
    "relative z-10 box-border flex shrink-0 items-center justify-center rounded-full border-2",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    SNAP_TRANSITION,
  ].join(" "),
  {
    variants: {
      status: {
        completed: "border-punch bg-punch text-punch-foreground",
        current:
          "border-punch bg-background text-foreground ring-[3px] ring-punch/30",
        pending: "border-border bg-background text-muted-foreground",
      },
      size: {
        dot: "size-3",
        icon: "size-7",
      },
    },
    defaultVariants: { status: "pending", size: "dot" },
  }
);

export const timelineConnectorVariants = cva(
  ["flex-1 rounded-full", SNAP_TRANSITION].join(" "),
  {
    variants: {
      orientation: {
        vertical: "w-px",
        horizontal: "h-px",
      },
      status: {
        completed: "bg-punch",
        current: "", // gradient set per-orientation in compoundVariants
        pending: "bg-border",
      },
    },
    compoundVariants: [
      {
        orientation: "vertical",
        status: "current",
        className: "bg-gradient-to-b from-punch to-border",
      },
      {
        orientation: "horizontal",
        status: "current",
        className: "bg-gradient-to-r from-punch to-border",
      },
    ],
    defaultVariants: { orientation: "vertical", status: "pending" },
  }
);

/* -------------------------------------------------------------------------- */
/*  Components                                                                  */
/* -------------------------------------------------------------------------- */

export type TimelineProps = ComponentProps<"ol"> &
  VariantProps<typeof timelineVariants> & {
    asChild?: boolean;
  };

export const Timeline = forwardRef<HTMLOListElement, TimelineProps>(
  (
    {
      className,
      orientation = "vertical",
      spacing = "comfortable",
      asChild = false,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "ol";
    return (
      <TimelineContext.Provider
        value={{
          orientation: orientation ?? "vertical",
          spacing: spacing ?? "comfortable",
        }}
      >
        <Comp
          ref={ref}
          data-slot="timeline"
          data-orientation={orientation}
          className={cn(timelineVariants({ orientation, spacing, className }))}
          {...props}
        >
          {children}
        </Comp>
      </TimelineContext.Provider>
    );
  }
);
Timeline.displayName = "Timeline";

export type TimelineItemProps = ComponentProps<"li"> & {
  status?: TimelineStatus;
  /** Optional marker content (an inline SVG / icon). Defaults to a bare dot. */
  icon?: ReactNode;
  asChild?: boolean;
};

export const TimelineItem = forwardRef<HTMLLIElement, TimelineItemProps>(
  (
    { className, status = "pending", icon, asChild = false, children, ...props },
    ref
  ) => {
    const { orientation } = useTimelineContext();
    const Comp = asChild ? Slot : "li";
    const hasMarkerContent = icon != null;
    return (
      <Comp
        ref={ref}
        data-slot="timeline-item"
        data-status={status}
        aria-current={status === "current" ? "step" : undefined}
        className={cn(
          "group/item relative flex",
          orientation === "vertical" ? "flex-row gap-x-3" : "flex-1 flex-col",
          className
        )}
        {...props}
      >
        <div
          data-slot="timeline-rail"
          aria-hidden
          className={cn(
            "flex shrink-0 items-center",
            orientation === "vertical" ? "w-7 flex-col" : "h-7 flex-row"
          )}
        >
          <TimelineMarker
            status={status}
            size={hasMarkerContent ? "icon" : "dot"}
          >
            {icon}
          </TimelineMarker>
          <TimelineConnector status={status} />
        </div>
        <TimelineContent>
          <span className="sr-only">{STATUS_LABEL[status]}</span>
          {children}
        </TimelineContent>
      </Comp>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

export type TimelineMarkerProps = ComponentProps<"span"> &
  VariantProps<typeof timelineMarkerVariants> & {
    asChild?: boolean;
  };

export const TimelineMarker = forwardRef<HTMLSpanElement, TimelineMarkerProps>(
  ({ className, status, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
        data-slot="timeline-marker"
        data-status={status ?? "pending"}
        className={cn(timelineMarkerVariants({ status, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
TimelineMarker.displayName = "TimelineMarker";

export type TimelineConnectorProps = ComponentProps<"span"> &
  VariantProps<typeof timelineConnectorVariants>;

export const TimelineConnector = forwardRef<
  HTMLSpanElement,
  TimelineConnectorProps
>(({ className, status, orientation, ...props }, ref) => {
  const ctx = useTimelineContext();
  const resolvedOrientation = orientation ?? ctx.orientation;
  return (
    <span
      ref={ref}
      data-slot="timeline-connector"
      data-status={status ?? "pending"}
      aria-hidden
      className={cn(
        timelineConnectorVariants({
          status,
          orientation: resolvedOrientation,
        }),
        // The last item terminates the rail — no trailing line.
        "group-last/item:hidden",
        className
      )}
      {...props}
    />
  );
});
TimelineConnector.displayName = "TimelineConnector";

export const TimelineContent = forwardRef<
  HTMLDivElement,
  ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { orientation, spacing } = useTimelineContext();
  const pad =
    orientation === "vertical"
      ? spacing === "dense"
        ? "pb-4"
        : "pb-8"
      : spacing === "dense"
        ? "pr-4"
        : "pr-8";
  return (
    <div
      ref={ref}
      data-slot="timeline-content"
      className={cn(
        "min-w-0",
        orientation === "vertical" ? "flex-1" : "pt-3",
        pad,
        // Last item drops its trailing spacing so the rail ends flush.
        "group-last/item:pb-0 group-last/item:pr-0",
        className
      )}
      {...props}
    />
  );
});
TimelineContent.displayName = "TimelineContent";

export const TimelineTime = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="timeline-time"
      className={cn(
        "text-xs font-medium tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
TimelineTime.displayName = "TimelineTime";

export const TimelineTitle = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="timeline-title"
      className={cn(
        "font-display text-sm leading-tight font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
);
TimelineTitle.displayName = "TimelineTitle";

export const TimelineDescription = forwardRef<
  HTMLDivElement,
  ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="timeline-description"
    className={cn("mt-1 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TimelineDescription.displayName = "TimelineDescription";
