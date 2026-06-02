import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders a span with default data attributes", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge.tagName).toBe("SPAN");
    expect(badge).toHaveAttribute("data-slot", "badge");
    expect(badge).toHaveAttribute("data-variant", "default");
  });

  it("reflects the variant in data-variant", () => {
    render(<Badge variant="destructive-subtle">High</Badge>);
    expect(screen.getByText("High")).toHaveAttribute(
      "data-variant",
      "destructive-subtle"
    );
  });

  it("merges a custom className", () => {
    render(<Badge className="custom-badge">Tag</Badge>);
    expect(screen.getByText("Tag")).toHaveClass("custom-badge");
  });

  it("renders as a child element when asChild is set", () => {
    render(
      <Badge asChild variant="outline">
        <a href="#target">Link</a>
      </Badge>
    );
    const link = screen.getByRole("link", { name: "Link" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("data-slot", "badge");
    expect(link).toHaveAttribute("href", "#target");
  });
});
