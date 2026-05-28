import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders an input with the placeholder", () => {
    render(<Input placeholder="Email" />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("exposes data-slot='input'", () => {
    render(<Input placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toHaveAttribute(
      "data-slot",
      "input"
    );
  });

  it("forwards a ref to the underlying input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("accepts user typing and reflects the value", async () => {
    render(<Input placeholder="x" />);
    const input = screen.getByPlaceholderText("x") as HTMLInputElement;
    await userEvent.type(input, "hello");
    expect(input.value).toBe("hello");
  });

  it("does not accept input when disabled", async () => {
    render(<Input placeholder="x" disabled />);
    const input = screen.getByPlaceholderText("x") as HTMLInputElement;
    await userEvent.type(input, "hi");
    expect(input.value).toBe("");
  });

  it("merges a custom className", () => {
    render(<Input placeholder="x" className="custom" />);
    expect(screen.getByPlaceholderText("x")).toHaveClass("custom");
  });
});
