import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./Select";

function Example(props: { defaultValue?: string; disabled?: boolean }) {
  return (
    <Select defaultValue={props.defaultValue} disabled={props.disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("renders the trigger with the placeholder when nothing is selected", () => {
    render(<Example />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveTextContent("Select a fruit");
  });

  it("shows the selected item's label for a default value", () => {
    render(<Example defaultValue="banana" />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Banana");
  });

  it("disables the trigger when disabled", () => {
    render(<Example disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
