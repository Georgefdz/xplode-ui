import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CheckSquare,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
} from "lucide-react";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCardFooter,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
  type KanbanColumn,
  type KanbanItemBase,
} from "./Kanban";

/* -------------------------------------------------------------------------- */
/* Sample data — lives in the story, not the component                         */
/* -------------------------------------------------------------------------- */

type Priority = "high" | "medium" | "low";

type Feature = KanbanItemBase & {
  title: string;
  description: string;
  priority: Priority;
  assignees: string[];
  comments: number;
  attachments: number;
  subtasks: [done: number, total: number];
};

const columns: KanbanColumn[] = [
  { id: "backlog", name: "Backlog", color: "bg-muted-foreground" },
  { id: "in-progress", name: "In Progress", color: "bg-punch" },
  { id: "done", name: "Done", color: "bg-primary" },
];

const seed: Feature[] = [
  {
    id: "1",
    column: "backlog",
    title: "Integrate Stripe payment gateway",
    description: "Wire up checkout, webhooks and the billing portal.",
    priority: "high",
    assignees: ["EJ", "DS"],
    comments: 4,
    attachments: 2,
    subtasks: [1, 6],
  },
  {
    id: "2",
    column: "backlog",
    title: "Audit color contrast tokens",
    description: "Verify every semantic token meets WCAG AA in both themes.",
    priority: "low",
    assignees: ["LB"],
    comments: 1,
    attachments: 0,
    subtasks: [0, 4],
  },
  {
    id: "3",
    column: "backlog",
    title: "Draft Q3 roadmap",
    description: "Collect input from design and engineering leads.",
    priority: "medium",
    assignees: ["MW", "JL", "SR"],
    comments: 8,
    attachments: 3,
    subtasks: [2, 5],
  },
  {
    id: "4",
    column: "in-progress",
    title: "Build the Kanban component",
    description: "Compound, controlled API on top of dnd-kit with tokens only.",
    priority: "high",
    assignees: ["GF"],
    comments: 12,
    attachments: 1,
    subtasks: [5, 7],
  },
  {
    id: "5",
    column: "in-progress",
    title: "Migrate docs to Storybook 10",
    description: "Move every MDX page and wire up the a11y addon.",
    priority: "medium",
    assignees: ["DS", "EJ"],
    comments: 3,
    attachments: 5,
    subtasks: [3, 8],
  },
  {
    id: "6",
    column: "done",
    title: "Ship Dialog component",
    description: "Radix-backed dialog with the shared focus ring.",
    priority: "medium",
    assignees: ["GF", "LB"],
    comments: 6,
    attachments: 0,
    subtasks: [5, 5],
  },
  {
    id: "7",
    column: "done",
    title: "Set up OKLCH token system",
    description: "Semantic tokens with class-based dark mode.",
    priority: "high",
    assignees: ["GF"],
    comments: 2,
    attachments: 1,
    subtasks: [4, 4],
  },
];

const priorityVariant = {
  high: "destructive-subtle",
  medium: "punch-subtle",
  low: "muted",
} as const;

/* -------------------------------------------------------------------------- */
/* TaskCard                                                                   */
/* -------------------------------------------------------------------------- */

function TaskCard({ feature }: { feature: Feature }) {
  return (
    <>
      <Badge variant={priorityVariant[feature.priority]} className="capitalize">
        {feature.priority}
      </Badge>

      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {feature.description}
        </p>
      </div>

      <div className="h-px w-full bg-border" />

      <KanbanCardFooter>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MessageSquare />
            {feature.comments}
          </span>
          <span className="flex items-center gap-1">
            <Paperclip />
            {feature.attachments}
          </span>
          <span className="flex items-center gap-1">
            <CheckSquare />
            {feature.subtasks[0]}/{feature.subtasks[1]}
          </span>
        </div>
        <div className="flex items-center">
          {feature.assignees.map((initials) => (
            <span
              key={initials}
              className="-ml-1.5 inline-flex size-6 items-center justify-center rounded-full border-2 border-card bg-secondary text-[10px] font-medium text-secondary-foreground first:ml-0"
            >
              {initials}
            </span>
          ))}
        </div>
      </KanbanCardFooter>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Stateful board wrapper so drags persist within a story                      */
/* -------------------------------------------------------------------------- */

function Board({
  initial,
  renderItem = (feature) => <TaskCard feature={feature} />,
}: {
  initial: Feature[];
  renderItem?: (feature: Feature) => ReactNode;
}) {
  const [data, setData] = useState(initial);

  return (
    <KanbanProvider
      columns={columns}
      data={data}
      onDataChange={setData}
      renderOverlay={(feature) => (
        <KanbanCard
          id={feature.id}
          column={feature.column}
          asOverlay
          className="w-64"
        >
          {renderItem(feature)}
        </KanbanCard>
      )}
    >
      {(column) => (
        <KanbanBoard id={column.id}>
          <KanbanHeader
            name={column.name}
            color={column.color}
            count={
              data.filter((feature) => feature.column === column.id).length
            }
            actions={
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Add task to ${column.name}`}
                >
                  <Plus />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${column.name} options`}
                >
                  <MoreHorizontal />
                </Button>
              </>
            }
          />
          <KanbanCards id={column.id}>
            {(feature: Feature) => (
              <KanbanCard id={feature.id} column={feature.column}>
                {renderItem(feature)}
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Stories                                                                     */
/* -------------------------------------------------------------------------- */

const meta = {
  title: "Components/Kanban",
  component: KanbanProvider,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A controlled, drag-and-drop Kanban board built on dnd-kit. " +
          "`KanbanCard` is content-agnostic — the rich card here (priority " +
          "Badge, avatars, counts) lives in the story, not the primitive.",
      },
    },
  },
} satisfies Meta<typeof KanbanProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Board initial={seed} />,
};

export const DarkMode: Story = {
  render: () => (
    <div className="dark rounded-lg bg-background p-6">
      <Board initial={seed} />
    </div>
  ),
};

export const Empty: Story = {
  name: "Empty columns",
  render: () => (
    <Board initial={seed.filter((feature) => feature.column === "backlog")} />
  ),
};

export const Playground: Story = {
  name: "Minimal cards",
  render: () => (
    <Board
      initial={seed}
      renderItem={(feature) => (
        <span className="text-sm font-medium text-foreground">
          {feature.title}
        </span>
      )}
    />
  ),
};
