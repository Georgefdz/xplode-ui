import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "outline", "accent-bar"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-[360px]">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input type="email" placeholder="you@example.com" />
        <Input type="password" placeholder="••••••••" />
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost">Cancel</Button>
        <Button variant="punch">Sign up</Button>
      </CardFooter>
    </Card>
  ),
};

export const Outline: Story = {
  args: { variant: "outline" },
  render: (args) => (
    <Card {...args} className="w-[360px]">
      <CardHeader>
        <CardTitle>Outline variant</CardTitle>
        <CardDescription>No shadow, slightly heavier border.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Editorial restraint — works well alongside dense content.
        </p>
      </CardContent>
    </Card>
  ),
};

export const AccentBar: Story = {
  args: { variant: "accent-bar" },
  render: (args) => (
    <Card {...args} className="w-[360px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            Mark all read
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The 3 px chartreuse left bar is the Xplode flourish.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {(["default", "outline", "accent-bar"] as const).map((v) => (
        <Card key={v} variant={v} className="w-[260px]">
          <CardHeader>
            <CardTitle className="capitalize">{v.replace("-", " ")}</CardTitle>
            <CardDescription>variant={v}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Same content, three skins.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
