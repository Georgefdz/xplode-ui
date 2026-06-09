import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./DataTable";
import { createDataTableColumnHelper } from "./useDataTable";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "./Table";

type Person = { id: string; name: string; score: number };

const people: Person[] = [
  { id: "1", name: "Bravo", score: 2 },
  { id: "2", name: "Alpha", score: 3 },
  { id: "3", name: "Charlie", score: 1 },
];

const columnHelper = createDataTableColumnHelper<Person>();
const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("score", { header: "Score" }),
]);

/** First-cell text of every body row, in document order. */
function bodyFirstCells() {
  const table = screen.getByRole("table");
  const rows = within(table).getAllByRole("row").slice(1); // drop header row
  return rows.map((row) => within(row).getAllByRole("cell")[0]?.textContent);
}

describe("Table primitives", () => {
  it("renders semantic markup with data-slot hooks", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole("table")).toHaveAttribute("data-slot", "table");
    expect(screen.getByText("Ada")).toHaveAttribute("data-slot", "table-cell");
  });
});

describe("DataTable", () => {
  it("renders a row per data item with headers", () => {
    render(<DataTable columns={columns} data={people} />);
    expect(screen.getByRole("columnheader", { name: /name/i })).toBeInTheDocument();
    expect(bodyFirstCells()).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  it("sorts ascending when a sortable header is clicked", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={people} />);

    await user.click(screen.getByRole("button", { name: /name/i }));
    expect(bodyFirstCells()).toEqual(["Alpha", "Bravo", "Charlie"]);

    // Second click flips to descending.
    await user.click(screen.getByRole("button", { name: /name/i }));
    expect(bodyFirstCells()).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("paginates through pages", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={people} enablePagination pageSize={2} />);

    expect(bodyFirstCells()).toEqual(["Bravo", "Alpha"]);
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(bodyFirstCells()).toEqual(["Charlie"]);
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
  });

  it("selects all rows via the header checkbox", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={people}
        enableRowSelection
        getRowId={(row) => row.id}
      />
    );

    expect(screen.getByText(/0 of 3 row\(s\) selected/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: /select all rows/i })
    );
    expect(screen.getByText(/3 of 3 row\(s\) selected/i)).toBeInTheDocument();

    const selectedRows = screen
      .getByRole("table")
      .querySelectorAll('tr[data-state="selected"]');
    expect(selectedRows).toHaveLength(3);
  });

  it("hides a column through the visibility menu", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={people} enableColumnVisibility />);

    expect(
      screen.getByRole("columnheader", { name: /name/i })
    ).toBeInTheDocument();

    // The menu checkboxes are always in the DOM; toggling "Name" hides it.
    await user.click(screen.getByRole("checkbox", { name: /^name$/i }));
    expect(
      screen.queryByRole("columnheader", { name: /name/i })
    ).not.toBeInTheDocument();
  });

  it("fires onRowClick on a cell click but not on the selection checkbox", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={people}
        enableRowSelection
        getRowId={(row) => row.id}
        onRowClick={onRowClick}
      />
    );

    await user.click(screen.getByText("Bravo"));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Bravo" })
    );

    // Clicking a row's selection checkbox must not also trigger the row click.
    await user.click(screen.getAllByRole("checkbox", { name: /select row/i })[0]);
    expect(onRowClick).toHaveBeenCalledTimes(1);
  });

  it("keeps showing every row when data grows and pagination is off", () => {
    const { rerender } = render(
      <DataTable columns={columns} data={people.slice(0, 1)} />
    );
    expect(bodyFirstCells()).toEqual(["Bravo"]);

    // Regression: initialState pageSize must not freeze at the mount-time length.
    rerender(<DataTable columns={columns} data={people} />);
    expect(bodyFirstCells()).toEqual(["Bravo", "Alpha", "Charlie"]);
  });

  it("applies column meta alignment to the header and its cells", () => {
    const aligned = columnHelper.columns([
      columnHelper.accessor("name", { header: "Name" }),
      columnHelper.accessor("score", { header: "Score", meta: { align: "right" } }),
    ]);
    render(<DataTable columns={aligned} data={people} />);

    expect(screen.getByRole("columnheader", { name: /score/i })).toHaveClass(
      "text-right"
    );
    const firstRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    expect(within(firstRow).getAllByRole("cell")[1]).toHaveClass("text-right");
  });

  it("expands and collapses a row when it is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={people}
        renderExpandedRow={(person) => <div>Detail for {person.name}</div>}
      />
    );

    const firstRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    const detailRow = screen.getByText("Detail for Bravo").closest("tr");
    expect(firstRow).toHaveAttribute("aria-expanded", "false");
    expect(detailRow).toHaveAttribute("data-state", "closed");

    await user.click(within(firstRow).getByText("Bravo"));
    expect(firstRow).toHaveAttribute("aria-expanded", "true");
    expect(detailRow).toHaveAttribute("data-state", "open");

    // A second click collapses it again.
    await user.click(within(firstRow).getByText("Bravo"));
    expect(firstRow).toHaveAttribute("aria-expanded", "false");
    expect(detailRow).toHaveAttribute("data-state", "closed");
  });

  it("toggles expansion with the Enter key on a focused row", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={people}
        renderExpandedRow={(person) => <div>Detail for {person.name}</div>}
      />
    );

    const firstRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    firstRow.focus();
    await user.keyboard("{Enter}");
    expect(firstRow).toHaveAttribute("aria-expanded", "true");
  });

  it("does not expand the row when its selection checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={people}
        enableRowSelection
        getRowId={(row) => row.id}
        renderExpandedRow={(person) => <div>Detail for {person.name}</div>}
      />
    );

    const firstRow = within(screen.getByRole("table")).getAllByRole("row")[1];
    await user.click(
      within(firstRow).getByRole("checkbox", { name: /select row/i })
    );
    expect(firstRow).toHaveAttribute("data-state", "selected");
    expect(firstRow).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the empty state when there are no rows", () => {
    render(
      <DataTable columns={columns} data={[]} emptyMessage="Nothing here" />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});
