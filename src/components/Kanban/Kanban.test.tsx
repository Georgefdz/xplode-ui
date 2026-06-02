import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "./Kanban";
import {
  moveItem,
  findColumn,
  type KanbanColumn,
  type KanbanItemBase,
} from "./Kanban.utils";

type Item = KanbanItemBase & { title: string };

const columns: KanbanColumn[] = [
  { id: "todo", name: "To Do" },
  { id: "doing", name: "Doing" },
  { id: "done", name: "Done" },
];

const data: Item[] = [
  { id: "a", column: "todo", title: "A" },
  { id: "b", column: "todo", title: "B" },
  { id: "c", column: "doing", title: "C" },
];

const ids = (items: Item[]) => items.map((item) => item.id);

describe("moveItem", () => {
  it("reorders within the same column", () => {
    const next = moveItem(data, "a", "b", columns);
    expect(ids(next)).toEqual(["b", "a", "c"]);
    expect(next.find((i) => i.id === "a")?.column).toBe("todo");
  });

  it("moves a card onto another card in a different column", () => {
    const next = moveItem(data, "a", "c", columns);
    expect(next.find((i) => i.id === "a")?.column).toBe("doing");
    expect(ids(next.filter((i) => i.column === "doing"))).toEqual(["a", "c"]);
    expect(ids(next.filter((i) => i.column === "todo"))).toEqual(["b"]);
  });

  it("moves a card onto an empty column via the column id", () => {
    const next = moveItem(data, "a", "done", columns);
    expect(next.find((i) => i.id === "a")?.column).toBe("done");
    expect(ids(next.filter((i) => i.column === "done"))).toEqual(["a"]);
  });

  it("returns the same reference for no-op moves", () => {
    expect(moveItem(data, "a", "a", columns)).toBe(data);
    expect(moveItem(data, "a", "missing", columns)).toBe(data);
  });
});

describe("findColumn", () => {
  it("resolves a card id to its column", () => {
    expect(findColumn(data, columns, "c")).toBe("doing");
  });
  it("returns a column id unchanged", () => {
    expect(findColumn(data, columns, "done")).toBe("done");
  });
  it("returns null for unknown ids", () => {
    expect(findColumn(data, columns, "missing")).toBeNull();
  });
});

function Harness() {
  return (
    <KanbanProvider columns={columns} data={data}>
      {(column) => (
        <KanbanBoard id={column.id} data-testid={`board-${column.id}`}>
          <KanbanHeader
            name={column.name}
            count={data.filter((item) => item.column === column.id).length}
          />
          <KanbanCards id={column.id}>
            {(item: Item) => (
              <KanbanCard
                id={item.id}
                column={item.column}
                data-testid={`card-${item.id}`}
              >
                {item.title}
              </KanbanCard>
            )}
          </KanbanCards>
        </KanbanBoard>
      )}
    </KanbanProvider>
  );
}

describe("Kanban rendering", () => {
  it("renders one droppable board per column with the right counts", () => {
    render(<Harness />);

    const todo = screen.getByTestId("board-todo");
    expect(todo).toHaveAttribute("data-slot", "kanban-board");
    expect(within(todo).getByText("To Do")).toBeInTheDocument();
    expect(within(todo).getByText("2")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("board-doing")).getByText("1")
    ).toBeInTheDocument();
  });

  it("renders sortable cards with accessibility attributes", () => {
    render(<Harness />);

    const card = screen.getByTestId("card-a");
    expect(card).toHaveAttribute("data-slot", "kanban-card");
    expect(card).toHaveAttribute("tabindex", "0");
    expect(card).toHaveAttribute("aria-roledescription");
    expect(card).toHaveTextContent("A");
  });

  it("shows the empty-state placeholder for columns with no items", () => {
    render(<Harness />);
    const done = screen.getByTestId("board-done");
    expect(within(done).getByText("Drop tasks here")).toBeInTheDocument();
  });
});
