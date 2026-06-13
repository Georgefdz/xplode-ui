import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, MapPin, Package, Truck } from "lucide-react";
import {
  Timeline,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
  TimelineDescription,
} from "./Timeline";

const meta = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
    },
    spacing: {
      control: "inline-radio",
      options: ["comfortable", "dense"],
    },
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Timeline {...args} className="w-[360px]">
      <TimelineItem status="completed">
        <TimelineTime>09:00</TimelineTime>
        <TimelineTitle>Order placed</TimelineTitle>
        <TimelineDescription>
          We received your order and sent a confirmation email.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem status="completed">
        <TimelineTime>10:24</TimelineTime>
        <TimelineTitle>Packed</TimelineTitle>
        <TimelineDescription>
          Your items were packed and handed to the courier.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem status="current">
        <TimelineTime>11:20</TimelineTime>
        <TimelineTitle>Out for delivery</TimelineTitle>
        <TimelineDescription>Your courier is on the way.</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="pending">
        <TimelineTitle>Delivered</TimelineTitle>
        <TimelineDescription>
          Estimated to arrive before 1:00 PM.
        </TimelineDescription>
      </TimelineItem>
    </Timeline>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <Timeline {...args} className="w-[360px]">
      <TimelineItem status="completed" icon={<Check />}>
        <TimelineTime>09:00</TimelineTime>
        <TimelineTitle>Order placed</TimelineTitle>
        <TimelineDescription>Confirmation email sent.</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="completed" icon={<Package />}>
        <TimelineTime>10:24</TimelineTime>
        <TimelineTitle>Packed</TimelineTitle>
        <TimelineDescription>Handed to the courier.</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="current" icon={<Truck />}>
        <TimelineTime>11:20</TimelineTime>
        <TimelineTitle>Out for delivery</TimelineTitle>
        <TimelineDescription>Your courier is on the way.</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="pending" icon={<MapPin />}>
        <TimelineTitle>Delivered</TimelineTitle>
        <TimelineDescription>Arrives before 1:00 PM.</TimelineDescription>
      </TimelineItem>
    </Timeline>
  ),
};

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <Timeline {...args} className="w-[640px]">
      <TimelineItem status="completed" icon={<Check />}>
        <TimelineTitle>Order placed</TimelineTitle>
        <TimelineDescription>09:00</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="completed" icon={<Package />}>
        <TimelineTitle>Packed</TimelineTitle>
        <TimelineDescription>10:24</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="current" icon={<Truck />}>
        <TimelineTitle>Out for delivery</TimelineTitle>
        <TimelineDescription>11:20</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="pending" icon={<MapPin />}>
        <TimelineTitle>Delivered</TimelineTitle>
        <TimelineDescription>~13:00</TimelineDescription>
      </TimelineItem>
    </Timeline>
  ),
};

export const Dense: Story = {
  args: { spacing: "dense" },
  render: (args) => (
    <Timeline {...args} className="w-[360px]">
      <TimelineItem status="completed">
        <TimelineTitle>Signed up</TimelineTitle>
      </TimelineItem>
      <TimelineItem status="completed">
        <TimelineTitle>Verified email</TimelineTitle>
      </TimelineItem>
      <TimelineItem status="current">
        <TimelineTitle>Completed profile</TimelineTitle>
      </TimelineItem>
      <TimelineItem status="pending">
        <TimelineTitle>Invited a teammate</TimelineTitle>
      </TimelineItem>
    </Timeline>
  ),
};

export const SingleItem: Story = {
  render: (args) => (
    <Timeline {...args} className="w-[360px]">
      <TimelineItem status="current" icon={<Truck />}>
        <TimelineTime>Now</TimelineTime>
        <TimelineTitle>Out for delivery</TimelineTitle>
        <TimelineDescription>
          A lone item renders no trailing connector.
        </TimelineDescription>
      </TimelineItem>
    </Timeline>
  ),
};

export const LongContent: Story = {
  render: (args) => (
    <Timeline {...args} className="w-[360px]">
      <TimelineItem status="completed">
        <TimelineTime>Mon</TimelineTime>
        <TimelineTitle>Kickoff</TimelineTitle>
        <TimelineDescription>
          The connector stretches to match content height, so the rail stays
          continuous no matter how tall an item grows. This paragraph is here to
          demonstrate exactly that — several lines of copy push the next marker
          down and the line follows it cleanly.
        </TimelineDescription>
      </TimelineItem>
      <TimelineItem status="current">
        <TimelineTime>Wed</TimelineTime>
        <TimelineTitle>Review</TimelineTitle>
        <TimelineDescription>Short follow-up.</TimelineDescription>
      </TimelineItem>
      <TimelineItem status="pending">
        <TimelineTitle>Ship</TimelineTitle>
      </TimelineItem>
    </Timeline>
  ),
};

export const DarkMode: Story = {
  render: (args) => (
    <div className="dark rounded-lg bg-background p-6">
      <Timeline {...args} className="w-[360px]">
        <TimelineItem status="completed" icon={<Check />}>
          <TimelineTitle>Order placed</TimelineTitle>
          <TimelineDescription>Punch holds up in dark mode.</TimelineDescription>
        </TimelineItem>
        <TimelineItem status="current" icon={<Truck />}>
          <TimelineTitle>Out for delivery</TimelineTitle>
          <TimelineDescription>The ringed current marker.</TimelineDescription>
        </TimelineItem>
        <TimelineItem status="pending" icon={<MapPin />}>
          <TimelineTitle>Delivered</TimelineTitle>
          <TimelineDescription>Muted pending state.</TimelineDescription>
        </TimelineItem>
      </Timeline>
    </div>
  ),
};
