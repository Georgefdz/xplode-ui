import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { type ComponentProps } from "react";
import { FileText, RefreshCw, Wallet } from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "./Sidebar";
import type { SidebarGroup } from "./Sidebar";

// jsdom does not implement matchMedia, which the Sidebar's mobile-detection
// hook (useIsMobile) relies on. Stub it for this suite (defaults to desktop).
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
});

const groups: SidebarGroup[] = [
  {
    title: "Portfolio",
    items: [
      { id: "certificates", label: "Certificates", icon: FileText },
      {
        id: "renewals",
        label: "Renewals",
        icon: RefreshCw,
        badge: { value: 3, kind: "count" },
      },
    ],
  },
  {
    title: "Income",
    items: [
      {
        id: "bonuses",
        label: "Bonuses",
        icon: Wallet,
        badge: { value: 4750, kind: "money" },
      },
      { id: "hidden", label: "Hidden", icon: FileText, show: false },
    ],
  },
];

function renderSidebar(props?: Partial<ComponentProps<typeof Sidebar>>) {
  return render(
    <SidebarProvider>
      <Sidebar groups={groups} activeId="certificates" {...props} />
    </SidebarProvider>
  );
}

describe("Sidebar", () => {
  it("renders group titles and items", () => {
    renderSidebar();
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Certificates")).toBeInTheDocument();
    expect(screen.getByText("Renewals")).toBeInTheDocument();
    expect(screen.getByText("Bonuses")).toBeInTheDocument();
  });

  it("hides items with show: false", () => {
    renderSidebar();
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders count and money badges", () => {
    renderSidebar({ locale: "en-US" });
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("$4,750")).toBeInTheDocument();
  });

  it("marks the active item with data-active", () => {
    renderSidebar({ activeId: "renewals" });
    const active = screen
      .getByText("Renewals")
      .closest("button") as HTMLButtonElement;
    expect(active).toHaveAttribute("data-active", "true");
    const inactive = screen
      .getByText("Certificates")
      .closest("button") as HTMLButtonElement;
    expect(inactive).not.toHaveAttribute("data-active");
  });

  it("invokes an item's onClick handler", () => {
    const onClick = vi.fn();
    render(
      <SidebarProvider>
        <Sidebar
          groups={[
            { title: "G", items: [{ id: "a", label: "A", icon: FileText, onClick }] },
          ]}
        />
      </SidebarProvider>
    );
    fireEvent.click(screen.getByText("A"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders the sidebar panel with the expanded data-state by default", () => {
    renderSidebar();
    const panel = document.querySelector('[data-slot="sidebar"]');
    expect(panel).toHaveAttribute("data-state", "expanded");
  });

  it("toggles collapsed state via SidebarTrigger", () => {
    render(
      <SidebarProvider>
        <SidebarTrigger />
        <Sidebar groups={groups} />
      </SidebarProvider>
    );
    const panel = document.querySelector('[data-slot="sidebar"]')!;
    expect(panel).toHaveAttribute("data-state", "expanded");
    fireEvent.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    expect(panel).toHaveAttribute("data-state", "collapsed");
  });

  it("throws when useSidebar is used outside a provider", () => {
    const Bad = () => {
      useSidebar();
      return null;
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(
      /useSidebar must be used within a <SidebarProvider>/
    );
    spy.mockRestore();
  });
});
