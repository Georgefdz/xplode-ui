import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Type something…",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Email: Story = {
  args: { type: "email", placeholder: "you@example.com" },
};

export const Password: Story = {
  args: { type: "password", placeholder: "••••••••" },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled input" },
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "not-an-email" },
};

export const File: Story = {
  args: { type: "file" },
};

export const InsideLabel: Story = {
  render: (args) => (
    <label className="flex w-full max-w-sm flex-col gap-1.5 text-sm">
      <span className="font-medium">Email</span>
      <Input {...args} type="email" placeholder="you@example.com" />
      <span className="text-muted-foreground text-xs">
        We&apos;ll never share your email.
      </span>
    </label>
  ),
};
