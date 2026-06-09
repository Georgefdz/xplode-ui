import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../Badge";
import { Button } from "../Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../Dialog";
import { DataTable, type DataTableProps } from "./DataTable";
import { createDataTableColumnHelper } from "./useDataTable";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

/* -------------------------------------------------------------------------- */
/* Sample data                                                                 */
/* -------------------------------------------------------------------------- */

type Member = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "active" | "invited" | "suspended";
  amount: number;
};

const members: Member[] = [
  {
    id: "1",
    name: "Ada Lovelace",
    email: "ada@xplode.dev",
    role: "Admin",
    status: "active",
    amount: 1200,
  },
  {
    id: "2",
    name: "Alan Turing",
    email: "alan@xplode.dev",
    role: "Editor",
    status: "active",
    amount: 640,
  },
  {
    id: "3",
    name: "Grace Hopper",
    email: "grace@xplode.dev",
    role: "Admin",
    status: "invited",
    amount: 980,
  },
  {
    id: "4",
    name: "Katherine Johnson",
    email: "katherine@xplode.dev",
    role: "Viewer",
    status: "active",
    amount: 310,
  },
  {
    id: "5",
    name: "Linus Torvalds",
    email: "linus@xplode.dev",
    role: "Editor",
    status: "suspended",
    amount: 75,
  },
  {
    id: "6",
    name: "Margaret Hamilton",
    email: "margaret@xplode.dev",
    role: "Admin",
    status: "active",
    amount: 2040,
  },
  {
    id: "7",
    name: "Dennis Ritchie",
    email: "dennis@xplode.dev",
    role: "Viewer",
    status: "invited",
    amount: 0,
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusVariant = {
  active: "punch-subtle",
  invited: "muted",
  suspended: "destructive-subtle",
} as const;

const columnHelper = createDataTableColumnHelper<Member>();

const columns = columnHelper.columns([
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: ({ getValue }) => <Badge variant="outline">{getValue()}</Badge>,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    meta: { align: "right" },
    cell: ({ getValue }) => (
      <span className="tabular-nums">{currency.format(getValue())}</span>
    ),
  }),
]);

/* -------------------------------------------------------------------------- */
/* Meta                                                                        */
/* -------------------------------------------------------------------------- */

const meta = {
  title: "Components/Table",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Styled table primitives plus a `DataTable` powered by TanStack Table v9. " +
          "The engine (sorting, pagination, selection, column visibility) is wired up " +
          "once via `createTableHook`; the primitives own all the markup and styling.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "striped"] },
    enableSorting: { control: "boolean" },
    enablePagination: { control: "boolean" },
    enableRowSelection: { control: "boolean" },
    enableColumnVisibility: { control: "boolean" },
    pageSize: { control: { type: "number", min: 1 } },
  },
  args: {
    columns,
    data: members,
  },
} satisfies Meta<typeof DataTable<Member, unknown>>;

export default meta;
type Story = StoryObj<typeof meta>;

/* -------------------------------------------------------------------------- */
/* Primitives (no TanStack)                                                    */
/* -------------------------------------------------------------------------- */

export const Primitives: Story = {
  name: "Primitives (static)",
  render: () => (
    <Table>
      <TableCaption>A list of recent team members.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.slice(0, 4).map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium text-foreground">
              {member.name}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{member.role}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[member.status]}>
                {member.status}
              </Badge>
            </TableCell>
            <TableCell className="tabular-nums">
              {currency.format(member.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="tabular-nums">
            {currency.format(
              members.slice(0, 4).reduce((sum, m) => sum + m.amount, 0)
            )}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Striped: Story = {
  render: () => (
    <Table variant="striped">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium text-foreground">
              {member.name}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {member.email}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{member.role}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

/* -------------------------------------------------------------------------- */
/* DataTable (TanStack v9)                                                     */
/* -------------------------------------------------------------------------- */

export const Basic: Story = {
  name: "Sortable",
  args: { enableSorting: true },
};

export const Pagination: Story = {
  name: "Pagination",
  args: { enablePagination: true, pageSize: 3 },
};

export const RowSelection: Story = {
  name: "Row selection",
  args: { enableRowSelection: true },
};

export const ColumnVisibility: Story = {
  name: "Column visibility",
  args: { enableColumnVisibility: true },
};

export const FullFeatured: Story = {
  name: "All features",
  args: {
    variant: "striped",
    enableSorting: true,
    enablePagination: true,
    pageSize: 4,
    enableRowSelection: true,
    enableColumnVisibility: true,
    caption: "Team members and their pending payouts.",
  },
};

function ClickableRowsExample(args: DataTableProps<Member>) {
  const [selected, setSelected] = useState<Member | null>(null);
  return (
    <>
      <DataTable
        {...args}
        caption="Click a row to view the member's details."
        onRowClick={setSelected}
      />
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>{selected?.email}</DialogDescription>
          </DialogHeader>
          {selected && (
            <dl className="grid grid-cols-[6rem_1fr] gap-y-3 text-sm">
              <dt className="text-muted-foreground">Role</dt>
              <dd>
                <Badge variant="outline">{selected.role}</Badge>
              </dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Badge variant={statusVariant[selected.status]}>
                  {selected.status}
                </Badge>
              </dd>
              <dt className="text-muted-foreground">Pending</dt>
              <dd className="font-medium tabular-nums">
                {currency.format(selected.amount)}
              </dd>
            </dl>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const ClickableRows: Story = {
  name: "Clickable rows (Dialog)",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `onRowClick` to make rows focusable and clickable. Clicks on " +
          "the selection checkbox or other interactive cells are ignored, so " +
          "row selection and the visibility menu keep working.",
      },
    },
  },
  args: { enableRowSelection: true },
  render: (args) => <ClickableRowsExample {...args} />,
};

export const ExpandableRows: Story = {
  name: "Expandable rows (accordion)",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `renderExpandedRow` to make each row an accordion: clicking the " +
          "row (or pressing Enter/Space) slides a detail panel open beneath it, " +
          "and clicking again collapses it. The panel animates open *and* closed " +
          "via a CSS grid-rows transition. Clicks on the selection checkbox or " +
          "other interactive cells are ignored, so selection keeps working.",
      },
    },
  },
  args: {
    enableRowSelection: true,
    caption: "Click a row to expand the member's details.",
    renderExpandedRow: (member: Member) => (
      <dl className="grid grid-cols-[6rem_1fr] gap-y-3 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd>{member.email}</dd>
        <dt className="text-muted-foreground">Role</dt>
        <dd>
          <Badge variant="outline">{member.role}</Badge>
        </dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <Badge variant={statusVariant[member.status]}>{member.status}</Badge>
        </dd>
        <dt className="text-muted-foreground">Pending</dt>
        <dd className="font-medium tabular-nums">
          {currency.format(member.amount)}
        </dd>
      </dl>
    ),
  },
};

export const Empty: Story = {
  name: "Empty",
  args: { data: [], emptyMessage: "No team members yet." },
};

export const DarkMode: Story = {
  render: (args) => (
    <div className="dark rounded-lg bg-background p-6">
      <DataTable {...args} />
    </div>
  ),
  args: {
    variant: "striped",
    enableSorting: true,
    enablePagination: true,
    pageSize: 4,
    enableRowSelection: true,
    enableColumnVisibility: true,
  },
};
