import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";

describe("Card", () => {
  it("renders the full composition with proper data-slots", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );

    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("data-slot", "card");
    expect(card.querySelector('[data-slot="card-header"]')).toBeInTheDocument();
    expect(card.querySelector('[data-slot="card-title"]')).toHaveTextContent(
      "Title"
    );
    expect(
      card.querySelector('[data-slot="card-description"]')
    ).toHaveTextContent("Description");
    expect(card.querySelector('[data-slot="card-content"]')).toHaveTextContent(
      "Body"
    );
    expect(card.querySelector('[data-slot="card-footer"]')).toHaveTextContent(
      "Footer"
    );
  });

  it("merges custom className on Card", () => {
    render(<Card data-testid="card" className="custom-card" />);
    expect(screen.getByTestId("card")).toHaveClass("custom-card");
  });
});
