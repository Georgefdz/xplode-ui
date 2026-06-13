import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import {
  Timeline,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
  TimelineDescription,
} from "./Timeline";

describe("Timeline", () => {
  it("renders the full composition with proper data-slots", () => {
    render(
      <Timeline data-testid="timeline">
        <TimelineItem status="completed">
          <TimelineTime>09:00</TimelineTime>
          <TimelineTitle>Order placed</TimelineTitle>
          <TimelineDescription>Confirmation sent.</TimelineDescription>
        </TimelineItem>
      </Timeline>
    );

    const timeline = screen.getByTestId("timeline");
    expect(timeline).toHaveAttribute("data-slot", "timeline");
    expect(timeline).toHaveAttribute("data-orientation", "vertical");
    expect(timeline.tagName).toBe("OL");
    expect(
      timeline.querySelector('[data-slot="timeline-item"]')
    ).toBeInTheDocument();
    expect(
      timeline.querySelector('[data-slot="timeline-marker"]')
    ).toBeInTheDocument();
    expect(
      timeline.querySelector('[data-slot="timeline-connector"]')
    ).toBeInTheDocument();
    expect(
      timeline.querySelector('[data-slot="timeline-content"]')
    ).toBeInTheDocument();
    expect(
      timeline.querySelector('[data-slot="timeline-time"]')
    ).toHaveTextContent("09:00");
    expect(
      timeline.querySelector('[data-slot="timeline-title"]')
    ).toHaveTextContent("Order placed");
    expect(
      timeline.querySelector('[data-slot="timeline-description"]')
    ).toHaveTextContent("Confirmation sent.");
  });

  it("reflects status on the item, marker, and connector", () => {
    render(
      <Timeline>
        <TimelineItem status="current" data-testid="item">
          <TimelineTitle>Current</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );

    const item = screen.getByTestId("item");
    expect(item).toHaveAttribute("data-status", "current");
    expect(item).toHaveAttribute("aria-current", "step");
    expect(item.querySelector('[data-slot="timeline-marker"]')).toHaveAttribute(
      "data-status",
      "current"
    );
    expect(
      item.querySelector('[data-slot="timeline-connector"]')
    ).toHaveAttribute("data-status", "current");
  });

  it("only sets aria-current on the current item", () => {
    render(
      <Timeline>
        <TimelineItem status="completed" data-testid="done">
          <TimelineTitle>Done</TimelineTitle>
        </TimelineItem>
        <TimelineItem status="pending" data-testid="todo">
          <TimelineTitle>Todo</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );

    expect(screen.getByTestId("done")).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("todo")).not.toHaveAttribute("aria-current");
  });

  it("applies status-driven variant classes", () => {
    render(
      <Timeline>
        <TimelineItem status="completed" data-testid="completed">
          <TimelineTitle>Completed</TimelineTitle>
        </TimelineItem>
        <TimelineItem status="pending" data-testid="pending">
          <TimelineTitle>Pending</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );

    expect(
      screen
        .getByTestId("completed")
        .querySelector('[data-slot="timeline-marker"]')
    ).toHaveClass("bg-punch");
    expect(
      screen
        .getByTestId("pending")
        .querySelector('[data-slot="timeline-connector"]')
    ).toHaveClass("bg-border");
  });

  it("renders an sr-only status label per item", () => {
    render(
      <Timeline>
        <TimelineItem status="current">
          <TimelineTitle>Out for delivery</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("hides the trailing connector on the last item via group-last", () => {
    render(
      <Timeline>
        <TimelineItem status="completed">
          <TimelineTitle>First</TimelineTitle>
        </TimelineItem>
        <TimelineItem status="pending" data-testid="last">
          <TimelineTitle>Last</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );
    expect(
      screen.getByTestId("last").querySelector('[data-slot="timeline-connector"]')
    ).toHaveClass("group-last/item:hidden");
  });

  it("renders a custom icon inside the marker", () => {
    render(
      <Timeline>
        <TimelineItem
          status="completed"
          icon={<svg data-testid="icon" aria-hidden />}
        >
          <TimelineTitle>With icon</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );
    const marker = screen
      .getByText("With icon")
      .closest('[data-slot="timeline-item"]')!
      .querySelector('[data-slot="timeline-marker"]');
    expect(marker?.querySelector('[data-testid="icon"]')).toBeInTheDocument();
    expect(marker).toHaveClass("size-7");
  });

  it("switches layout for the horizontal orientation", () => {
    render(
      <Timeline orientation="horizontal" data-testid="timeline">
        <TimelineItem status="current" data-testid="item">
          <TimelineTitle>Step</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );
    const timeline = screen.getByTestId("timeline");
    expect(timeline).toHaveAttribute("data-orientation", "horizontal");
    expect(timeline).toHaveClass("flex-row");
    expect(
      screen
        .getByTestId("item")
        .querySelector('[data-slot="timeline-connector"]')
    ).toHaveClass("h-px");
  });

  it("merges a custom className on the root", () => {
    render(<Timeline data-testid="timeline" className="custom-timeline" />);
    expect(screen.getByTestId("timeline")).toHaveClass("custom-timeline");
  });

  it("forwards refs to the underlying ol and li elements", () => {
    const olRef = createRef<HTMLOListElement>();
    const liRef = createRef<HTMLLIElement>();
    render(
      <Timeline ref={olRef}>
        <TimelineItem ref={liRef} status="completed">
          <TimelineTitle>Item</TimelineTitle>
        </TimelineItem>
      </Timeline>
    );
    expect(olRef.current).toBeInstanceOf(HTMLOListElement);
    expect(liRef.current).toBeInstanceOf(HTMLLIElement);
  });

  it("renders the root as a child element when asChild is true", () => {
    render(
      <Timeline asChild>
        <nav data-testid="nav" />
      </Timeline>
    );
    const nav = screen.getByTestId("nav");
    expect(nav.tagName).toBe("NAV");
    expect(nav).toHaveAttribute("data-slot", "timeline");
  });
});
