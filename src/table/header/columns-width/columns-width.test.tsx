import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../../table/base";
import { TTableColumn } from "../../table/type";

afterEach(cleanup);

type Row = { name: string; age: number };

function cellWidth(tableId: string, row: number, col: number) {
  const cell = document.getElementById(
    `ReactUI:Table:${tableId}:Cell-${row}-${col}`
  );
  if (!cell) throw new Error(`cell ${row}-${col} not found`);
  return window.getComputedStyle(cell).width;
}

const col = (key: keyof Row, initialWidth?: number): TTableColumn<Row> =>
  key === "age"
    ? { key, type: "number", label: key, initialWidth }
    : { key, type: "string", label: key, initialWidth };

describe("column widths", () => {
  test("applies the initial width to body cells", () => {
    render(
      <Table
        id="A"
        cols={[col("name", 120), col("age")]}
        rows={[{ id: "1", name: "a", age: 1 }]}
      />
    );

    expect(cellWidth("A", 0, 0)).toBe("120px");
    expect(cellWidth("A", 0, 1)).toBe("200px");
  });

  test("tables on the same page keep their own widths", () => {
    render(
      <>
        <Table id="A" cols={[col("name", 100)]} rows={[{ id: "1", name: "a", age: 1 }]} />
        <Table id="B" cols={[col("name", 300)]} rows={[{ id: "1", name: "b", age: 1 }]} />
      </>
    );

    expect(cellWidth("A", 0, 0)).toBe("100px");
    expect(cellWidth("B", 0, 0)).toBe("300px");
  });

  test("cells on the next page get the column width", () => {
    const rows = Array.from({ length: 60 }, (_, i) => ({
      id: String(i).padStart(2, "0"),
      name: `n${i}`,
      age: i,
    }));
    const { container } = render(
      <Table id="P" cols={[col("name", 222)]} rows={rows} />
    );

    const page2 = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === "2"
    )!;
    fireEvent.click(page2);

    expect(
      document.getElementById("ReactUI:Table:P:Cell-0-0")!.textContent
    ).toBe("n50");
    expect(cellWidth("P", 0, 0)).toBe("222px");
  });

  test("columns added later get a width without warnings", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const rows = [{ id: "1", name: "a", age: 1 }];
    const { rerender } = render(<Table id="C" cols={[col("name", 150)]} rows={rows} />);

    rerender(<Table id="C" cols={[col("name", 150), col("age", 80)]} rows={rows} />);

    expect(cellWidth("C", 0, 1)).toBe("80px");
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test("dragging the header border resizes the column", () => {
    const { container } = render(
      <Table id="R" cols={[col("name", 150)]} rows={[{ id: "1", name: "a", age: 1 }]} />
    );
    const handle = container.querySelector(".cursor-col-resize")!;

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 150 });
    fireEvent.mouseUp(document);
    expect(cellWidth("R", 0, 0)).toBe("200px");

    // A second drag starts from the new width.
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 80 });
    fireEvent.mouseUp(document);
    expect(cellWidth("R", 0, 0)).toBe("180px");

    // It never gets narrower than the minimum width (50px by default).
    fireEvent.mouseDown(handle, { clientX: 300 });
    fireEvent.mouseMove(document, { clientX: 0 });
    fireEvent.mouseUp(document);
    expect(cellWidth("R", 0, 0)).toBe("50px");
  });
});
