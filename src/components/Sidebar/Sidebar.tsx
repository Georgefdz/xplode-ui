import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { focusRingClasses } from "../../utils/focusRing";
import { formatCurrency } from "../../utils/formatCurrency";
import { useIsMobile } from "../../hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../Tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "./Sheet";

// ─── Constants ──────────────────────────────────────────────────────────────

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;
const KEYBOARD_SHORTCUT = "b";
const STORAGE_KEY = "xplode-sidebar-collapsed";
const DEFAULT_LOCALE = "es-MX";

const SNAP_TRANSITION =
  "transition-[color,background-color,border-color] duration-150 [transition-timing-function:var(--ease-snap)]";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SidebarBadgeKind = "count" | "money";

export type SidebarBadge = {
  value: number;
  kind?: SidebarBadgeKind;
};

export type SidebarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  badge?: SidebarBadge;
  /** Set to `false` to hide the item. Defaults to shown. */
  show?: boolean;
};

export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
  /** Set to `false` to hide the whole group. Defaults to shown. */
  show?: boolean;
};

export type SidebarMenuItem = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  destructive?: boolean;
};

export type SidebarUser = {
  name: string;
  email: string;
  onLogout?: () => void;
  /** Optional grouped dropdown menu shown from the footer. Each inner array is a separated group. */
  menu?: SidebarMenuItem[][];
};

export type SidebarLabels = {
  expand: string;
  collapse: string;
  logout: string;
  navigation: string;
};

const DEFAULT_LABELS: SidebarLabels = {
  expand: "Expand sidebar",
  collapse: "Collapse sidebar",
  logout: "Log out",
  navigation: "Navigation",
};

export type SidebarProps = {
  groups: SidebarGroup[];
  user?: SidebarUser;
  logo?: ReactNode;
  logoCollapsed?: ReactNode;
  /** The id of the active item. Falls back to per-item `isActive` when omitted. */
  activeId?: string;
  /** Locale used to format `money` badges. Defaults to `"es-MX"`. */
  locale?: string;
  /** Override the default English UI strings. */
  labels?: Partial<SidebarLabels>;
};

// ─── Context & Hook ──────────────────────────────────────────────────────────

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a <SidebarProvider>.");
  }
  return ctx;
}

// ─── SidebarProvider ────────────────────────────────────────────────────────

export type SidebarProviderProps = ComponentProps<"div"> & {
  defaultCollapsed?: boolean;
};

export const SidebarProvider = forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultCollapsed = false, className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    const [collapsed, setCollapsed] = useState<boolean>(() => {
      if (typeof window === "undefined") return defaultCollapsed;
      const stored = window.localStorage.getItem(STORAGE_KEY);
      return stored === null ? defaultCollapsed : stored === "true";
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggle = useCallback(() => {
      if (isMobile) {
        setMobileOpen((v) => !v);
      } else {
        setCollapsed((v) => {
          const next = !v;
          if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, String(next));
          }
          return next;
        });
      }
    }, [isMobile]);

    // ⌘B / Ctrl-B toggles the rail.
    useEffect(() => {
      const handle = (e: KeyboardEvent) => {
        if (e.key === KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          toggle();
        }
      };
      window.addEventListener("keydown", handle);
      return () => window.removeEventListener("keydown", handle);
    }, [toggle]);

    const effectiveCollapsed = isMobile ? false : collapsed;

    const value = useMemo<SidebarContextValue>(
      () => ({
        collapsed: effectiveCollapsed,
        setCollapsed,
        toggle,
        isMobile,
        mobileOpen,
        setMobileOpen,
      }),
      [effectiveCollapsed, toggle, isMobile, mobileOpen]
    );

    return (
      <SidebarContext.Provider value={value}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            data-slot="sidebar-provider"
            style={
              {
                "--sidebar-width": `${
                  effectiveCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH
                }px`,
                ...style,
              } as CSSProperties
            }
            className={cn("flex min-h-svh w-full font-sans", className)}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

// ─── SidebarInset (main content region) ────────────────────────────────────

export const SidebarInset = forwardRef<
  HTMLElement,
  ComponentProps<"main">
>(({ className, ...props }, ref) => (
  <main
    ref={ref}
    data-slot="sidebar-inset"
    className={cn(
      "relative flex min-h-svh flex-1 flex-col overflow-auto bg-background text-foreground",
      className
    )}
    {...props}
  />
));
SidebarInset.displayName = "SidebarInset";

// ─── SidebarTrigger (external toggle button) ────────────────────────────────

export const SidebarTrigger = forwardRef<
  HTMLButtonElement,
  ComponentProps<"button">
>(({ className, onClick, ...props }, ref) => {
  const { toggle } = useSidebar();
  return (
    <button
      ref={ref}
      type="button"
      data-slot="sidebar-trigger"
      onClick={(e) => {
        onClick?.(e);
        toggle();
      }}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground",
        "cursor-pointer hover:bg-primary/85",
        SNAP_TRANSITION,
        focusRingClasses,
        className
      )}
      {...props}
    >
      <ChevronRight className="size-[18px]" strokeWidth={2.5} />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

// ─── Internal sub-components ──────────────────────────────────────────────────

function UserAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-punch font-bold text-punch-foreground"
    >
      {initials}
    </div>
  );
}

function UserIdentity({ user }: { user: SidebarUser }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="truncate text-[13px] font-semibold text-foreground">
        {user.name}
      </div>
      <div className="truncate text-[11px] text-muted-foreground">
        {user.email}
      </div>
    </div>
  );
}

function formatBadge(badge: SidebarBadge, locale: string) {
  return badge.kind === "money"
    ? formatCurrency(badge.value, locale)
    : String(badge.value);
}

function NavBadgePill({
  badge,
  active,
  locale,
}: {
  badge: SidebarBadge;
  active: boolean;
  locale: string;
}) {
  const base =
    "shrink-0 rounded-full px-2 py-[2px] text-[11px] font-bold leading-none";
  if (badge.kind === "money") {
    return (
      <span
        className={cn(
          base,
          active
            ? "bg-primary-foreground/15 text-primary-foreground"
            : "bg-punch text-punch-foreground"
        )}
      >
        {formatBadge(badge, locale)}
      </span>
    );
  }
  return (
    <span
      className={cn(
        base,
        active
          ? "bg-primary-foreground/15 text-primary-foreground"
          : "bg-destructive text-destructive-foreground"
      )}
    >
      {badge.value}
    </span>
  );
}

function NavBadgeDot() {
  return (
    <span className="pointer-events-none absolute top-1.5 right-1.5 size-[10px] rounded-full bg-destructive" />
  );
}

function NavItem({
  item,
  collapsed,
  activeId,
  locale,
  onItemClick,
}: {
  item: SidebarItem;
  collapsed: boolean;
  activeId?: string;
  locale: string;
  onItemClick?: () => void;
}) {
  const active = activeId !== undefined ? item.id === activeId : !!item.isActive;
  const hasBadge = !!item.badge && item.badge.value > 0;
  const Icon = item.icon;

  const handleClick = () => {
    item.onClick?.();
    onItemClick?.();
  };

  const button = (
    <button
      type="button"
      onClick={handleClick}
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full cursor-pointer items-center text-[14px] font-medium outline-none",
        SNAP_TRANSITION,
        focusRingClasses,
        collapsed
          ? "mx-auto size-12 justify-center gap-0 rounded-[10px]"
          : "h-10 gap-[10px] rounded-[10px] px-3",
        active
          ? "bg-primary font-semibold text-primary-foreground"
          : "bg-transparent text-foreground hover:bg-muted"
      )}
    >
      <Icon
        className={cn("shrink-0", collapsed ? "size-5" : "size-[18px]")}
        strokeWidth={active ? 2.5 : 2}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {hasBadge && (
            <NavBadgePill badge={item.badge!} active={active} locale={locale} />
          )}
        </>
      )}
      {collapsed && hasBadge && <NavBadgeDot />}
    </button>
  );

  if (collapsed) {
    return (
      <li className="relative">
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            <span>{item.label}</span>
            {hasBadge && (
              <span className="ml-1.5 text-xs opacity-75">
                ({formatBadge(item.badge!, locale)})
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return <li>{button}</li>;
}

function UserMenu({
  user,
  collapsed,
  labels,
}: {
  user: SidebarUser;
  collapsed: boolean;
  labels: SidebarLabels;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full cursor-pointer border-t border-border bg-transparent text-left outline-none hover:bg-muted",
            SNAP_TRANSITION,
            collapsed
              ? "flex justify-center p-3"
              : "flex items-center gap-2.5 px-4 py-4"
          )}
        >
          <UserAvatar name={user.name} size={collapsed ? 40 : 36} />
          {!collapsed && (
            <>
              <UserIdentity user={user} />
              {open ? (
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              )}
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="end"
        sideOffset={8}
        alignOffset={15}
        className="min-w-[14rem]"
      >
        {user.menu?.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <DropdownMenuSeparator />}
            {group.map((option, oi) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={oi}
                  variant={option.destructive ? "destructive" : "default"}
                  onSelect={() => option.onClick?.()}
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  <span className="flex-1 truncate">{option.label}</span>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
        {user.onLogout && (
          <>
            {user.menu && user.menu.length > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => user.onLogout?.()}
            >
              <LogOut className="size-4 shrink-0" />
              <span className="flex-1 truncate">{labels.logout}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── The sidebar panel ──────────────────────────────────────────────────────

type SidebarPanelProps = SidebarProps & {
  collapsed: boolean;
  labels: SidebarLabels;
  onToggle: () => void;
  onItemClick?: () => void;
};

function SidebarPanel({
  groups,
  user,
  logo,
  logoCollapsed,
  activeId,
  locale = DEFAULT_LOCALE,
  collapsed,
  labels,
  onToggle,
  onItemClick,
}: SidebarPanelProps) {
  const visibleGroups = groups
    .filter((g) => g.show !== false)
    .map((g) => ({ ...g, items: g.items.filter((i) => i.show !== false) }))
    .filter((g) => g.items.length > 0);

  const allItems = visibleGroups.flatMap((g) => g.items);

  return (
    <aside
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      style={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-background text-foreground"
    >
      {/* Header */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-4 pt-5 pb-5">
          <button
            type="button"
            onClick={onToggle}
            title={labels.expand}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/85",
              SNAP_TRANSITION,
              focusRingClasses
            )}
          >
            <ChevronRight className="size-[18px]" strokeWidth={2.5} />
            <span className="sr-only">{labels.expand}</span>
          </button>
          {logoCollapsed && (
            <div className="flex items-center justify-center">
              {logoCollapsed}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center px-5 pt-5 pb-6">
          {logo && <div className="min-w-0 flex-1">{logo}</div>}
          <button
            type="button"
            onClick={onToggle}
            title={labels.collapse}
            className={cn(
              "ml-auto flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md bg-secondary text-secondary-foreground hover:bg-muted",
              SNAP_TRANSITION,
              focusRingClasses
            )}
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            <span className="sr-only">{labels.collapse}</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav aria-label={labels.navigation} className="flex-1 overflow-y-auto px-3 pb-2">
        {collapsed ? (
          <ul className="flex flex-col gap-1">
            {allItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                collapsed
                activeId={activeId}
                locale={locale}
                onItemClick={onItemClick}
              />
            ))}
          </ul>
        ) : (
          visibleGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <div className="px-3 pt-2 pb-1.5 text-[11px] font-bold tracking-[0.06em] text-muted-foreground uppercase select-none">
                {group.title}
              </div>
              <ul className="flex flex-col gap-[2px]">
                {group.items.map((item) => (
                  <NavItem
                    key={item.id}
                    item={item}
                    collapsed={false}
                    activeId={activeId}
                    locale={locale}
                    onItemClick={onItemClick}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      {user &&
        (user.menu ? (
          <UserMenu user={user} collapsed={collapsed} labels={labels} />
        ) : (
          <div
            className={cn(
              "border-t border-border",
              collapsed
                ? "flex justify-center p-3"
                : "flex items-center gap-2.5 px-4 py-4"
            )}
          >
            <UserAvatar name={user.name} size={collapsed ? 40 : 36} />
            {!collapsed && (
              <>
                <UserIdentity user={user} />
                {user.onLogout && (
                  <button
                    type="button"
                    onClick={user.onLogout}
                    title={labels.logout}
                    className={cn(
                      "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                      SNAP_TRANSITION,
                      focusRingClasses
                    )}
                  >
                    <LogOut className="size-4" />
                    <span className="sr-only">{labels.logout}</span>
                  </button>
                )}
              </>
            )}
          </div>
        ))}
    </aside>
  );
}

// ─── Sidebar — public component ──────────────────────────────────────────────

export const Sidebar = (props: SidebarProps) => {
  const { collapsed, toggle, isMobile, mobileOpen, setMobileOpen } =
    useSidebar();
  const labels = { ...DEFAULT_LABELS, ...props.labels };

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent className="w-[240px]">
          <div className="sr-only">
            <SheetTitle>{labels.navigation}</SheetTitle>
            <SheetDescription>{labels.navigation}</SheetDescription>
          </div>
          <div className="h-full">
            <SidebarPanel
              {...props}
              collapsed={false}
              labels={labels}
              onToggle={() => setMobileOpen(false)}
              onItemClick={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      data-slot="sidebar-wrapper"
      className="sticky top-0 hidden h-svh md:flex"
      style={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        transition: "width 200ms ease-linear",
      }}
    >
      <SidebarPanel
        {...props}
        collapsed={collapsed}
        labels={labels}
        onToggle={toggle}
      />
    </div>
  );
};
