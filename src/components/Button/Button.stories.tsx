import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Mail, Trash2 } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "punch",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    asChild: { control: "boolean" },
    loading: { control: "boolean" },
  },
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Punch: Story = { args: { variant: "punch", children: "Get started" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Link: Story = { args: { variant: "link" } };

export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true, children: "Saving" } };

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="punch">Punch</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="xs">Extra small</Button>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="default">Default</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} variant="punch">
        <Mail /> Send email
      </Button>
      <Button {...args} variant="secondary">
        Next <ArrowRight />
      </Button>
      <Button {...args} variant="destructive">
        <Trash2 /> Delete
      </Button>
    </div>
  ),
};

export const IconOnly: Story = {
  args: { children: undefined },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="icon-xs" variant="ghost" aria-label="Mail"><Mail /></Button>
      <Button {...args} size="icon-sm" variant="ghost" aria-label="Mail"><Mail /></Button>
      <Button {...args} size="icon" variant="ghost" aria-label="Mail"><Mail /></Button>
      <Button {...args} size="icon-lg" variant="ghost" aria-label="Mail"><Mail /></Button>
    </div>
  ),
};

export const AsChild: Story = {
  args: { asChild: true },
  render: (args) => (
    <Button {...args}>
      <a href="https://example.com" target="_blank" rel="noreferrer">
        Visit example.com <ArrowRight />
      </a>
    </Button>
  ),
};

export const DarkMode: Story = {
  render: (args) => (
    <div className="dark bg-background p-6 rounded-lg">
      <div className="flex flex-wrap items-center gap-3">
        <Button {...args} variant="default">Default</Button>
        <Button {...args} variant="punch">Punch</Button>
        <Button {...args} variant="outline">Outline</Button>
        <Button {...args} variant="secondary">Secondary</Button>
        <Button {...args} variant="ghost">Ghost</Button>
        <Button {...args} variant="destructive">Destructive</Button>
      </div>
    </div>
  ),
};
