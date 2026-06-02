import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Checkbox disabled />
      <Checkbox disabled defaultChecked />
    </div>
  ),
};

export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const WithLabel: Story = {
  render: () => (
    <label
      htmlFor="terms"
      className="flex items-center gap-2 font-sans text-sm text-foreground select-none"
    >
      <Checkbox id="terms" />
      Accept terms and conditions
    </label>
  ),
};
