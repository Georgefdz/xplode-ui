import { createRef } from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders a checkbox with default data attributes", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("data-slot", "checkbox");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("toggles checked state on click", async () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("does not toggle when disabled", async () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute("data-state", "unchecked");
  });

  it("merges a custom className", () => {
    render(<Checkbox className="custom-checkbox" />);
    expect(screen.getByRole("checkbox")).toHaveClass("custom-checkbox");
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("checkbox"));
  });
});
