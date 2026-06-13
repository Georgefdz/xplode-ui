import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toast } from "./Toaster";
import { Button } from "../Button";

const meta = {
  title: "Components/Toast",
  component: Toaster,
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Toaster />
      <Button variant="outline" onClick={() => toast("Event has been created")}>
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Profile saved", {
            description: "Your changes are live.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Something went wrong", {
            description: "Please try again.",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Meeting scheduled", {
            description: "Friday, 3:00 PM",
            action: { label: "Undo", onClick: () => {} },
          })
        }
      >
        With action
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
              loading: "Saving…",
              success: "Saved!",
              error: "Failed to save",
            }
          )
        }
      >
        Promise
      </Button>
    </div>
  ),
};
