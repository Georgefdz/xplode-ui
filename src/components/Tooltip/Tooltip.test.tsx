import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./Tooltip";

describe("Tooltip", () => {
  it("renders the trigger", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Open</TooltipTrigger>
          <TooltipContent>Hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(
      screen.getByRole("button", { name: "Open" })
    ).toHaveAttribute("data-slot", "tooltip-trigger");
  });

  it("shows content when open is controlled", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Open</TooltipTrigger>
          <TooltipContent>Hint text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    // Radix renders the content (and an accessible copy) in a portal when open.
    expect(screen.getAllByText("Hint text").length).toBeGreaterThan(0);
  });
});
