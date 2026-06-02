import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Circle } from "lucide-react";
import { Badge } from "./Badge";

const VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "punch",
  "muted",
  "destructive-subtle",
  "punch-subtle",
] as const;

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: VARIANTS,
    },
    asChild: { control: "boolean" },
  },
  args: {
    children: "Badge",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Badge key={variant} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="punch-subtle">
        <Circle />
        In progress
      </Badge>
      <Badge variant="muted">
        <Check />
        Done
      </Badge>
    </div>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Badge asChild variant="outline">
      <a href="#kanban">View board</a>
    </Badge>
  ),
};
