import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  FileText,
  RefreshCw,
  Files,
  Wallet,
  LayoutDashboard,
  Settings,
  Users,
  Bell,
  User,
  LifeBuoy,
} from "lucide-react";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "./Sidebar";
import type { SidebarGroup, SidebarUser } from "./Sidebar";

const groups: SidebarGroup[] = [
  {
    title: "General",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "team", label: "Team", icon: Users },
      { id: "notifications", label: "Notifications", icon: Bell },
    ],
  },
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
      { id: "documents", label: "Documents", icon: Files },
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
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const user: SidebarUser = {
  name: "Ana Sofía López",
  email: "ana@xplode.ui",
  onLogout: () => console.log("Logged out"),
};

const userWithMenu: SidebarUser = {
  ...user,
  menu: [
    [
      { label: "Profile", icon: User, onClick: () => {} },
      { label: "Settings", icon: Settings, onClick: () => {} },
    ],
    [{ label: "Support", icon: LifeBuoy, onClick: () => {} }],
  ],
};

const Logo = () => (
  <span className="font-display text-lg font-bold tracking-tight">
    xplode<span className="text-muted-foreground">/ui</span>
  </span>
);

const LogoMark = () => (
  <span className="flex size-8 items-center justify-center rounded-md bg-punch font-display text-sm font-bold text-punch-foreground">
    x
  </span>
);

const PageBody = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 border-b border-border px-6 py-4">
    <SidebarTrigger className="md:hidden" />
    <div>
      <h1 className="font-display text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        Toggle the rail with the header button or ⌘/Ctrl + B.
      </p>
    </div>
  </div>
);

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    activeId: { control: "text" },
    locale: { control: "text" },
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive shell: lets the active item respond to clicks. */
function SidebarShell({
  defaultCollapsed = false,
  withMenu = false,
}: {
  defaultCollapsed?: boolean;
  withMenu?: boolean;
}) {
  const [activeId, setActiveId] = useState("dashboard");
  const data = groups.map((g) => ({
    ...g,
    items: g.items.map((i) => ({ ...i, onClick: () => setActiveId(i.id) })),
  }));

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <Sidebar
        groups={data}
        activeId={activeId}
        user={withMenu ? userWithMenu : user}
        logo={<Logo />}
        logoCollapsed={<LogoMark />}
      />
      <SidebarInset>
        <PageBody
          title={
            groups.flatMap((g) => g.items).find((i) => i.id === activeId)
              ?.label ?? "Dashboard"
          }
        />
        <div className="p-6 text-sm text-muted-foreground">
          Page content for <strong>{activeId}</strong>.
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const Default: Story = {
  render: () => <SidebarShell />,
};

export const Collapsed: Story = {
  render: () => <SidebarShell defaultCollapsed />,
};

export const WithBadges: Story = {
  render: () => {
    const [activeId, setActiveId] = useState("renewals");
    const data = groups.map((g) => ({
      ...g,
      items: g.items.map((i) => ({ ...i, onClick: () => setActiveId(i.id) })),
    }));
    return (
      <SidebarProvider>
        <Sidebar
          groups={data}
          activeId={activeId}
          user={user}
          logo={<Logo />}
          logoCollapsed={<LogoMark />}
        />
        <SidebarInset>
          <PageBody title="With badges" />
          <div className="p-6 text-sm text-muted-foreground">
            Count badges render in the destructive color; money badges use the
            punch color. Collapse the rail to see badge dots and tooltips.
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  },
};

export const WithUserMenu: Story = {
  render: () => <SidebarShell withMenu />,
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark">
      <SidebarShell withMenu />
    </div>
  ),
};
