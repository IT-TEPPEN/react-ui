import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "./base";
import { TPropsTable, TTableColumn, TTableCondition } from "./type";

type Row = { name: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前", initialWidth: 150 },
  { key: "age", type: "number", label: "年齢" },
];
const rows = Array.from({ length: 60 }, (_, i) => ({
  id: String(i + 1),
  name: `n${i + 1}`,
  age: 20 + (i % 30),
}));

afterEach(cleanup);

const firstId = (container: HTMLElement) =>
  container.querySelector("tbody tr[data-testid]")?.getAttribute("data-testid");

function renderTable(props: Partial<TPropsTable<Row>> = {}) {
  const reports: TTableCondition[] = [];
  const utils = render(
    <Table
      id="V"
      cols={cols}
      rows={rows}
      onConditionChange={(condition) => reports.push(condition)}
      {...props}
    />
  );
  return { ...utils, reports, last: () => reports[reports.length - 1] };
}

describe("page", () => {
  test("starts on the page given in initialCondition and reports it", () => {
    const { container, last } = renderTable({
      initialCondition: { pagination: { rowCountPerPage: 20, page: 3 } },
    });

    expect(firstId(container)).toBe("41");
    expect(last().pagination).toEqual({ rowCountPerPage: 20, page: 3 });
  });

  test("a page beyond the last one shows the last page", () => {
    const { container, last } = renderTable({
      initialCondition: { pagination: { rowCountPerPage: 20, page: 9 } },
    });

    expect(firstId(container)).toBe("41");
    expect(last().pagination.page).toBe(3);
  });

  test("waits for rows that arrive later (e.g. loaded asynchronously)", () => {
    const initialCondition = { pagination: { rowCountPerPage: 20 as const, page: 2 } };
    const { container, rerender } = render(
      <Table id="V" cols={cols} rows={[]} loading initialCondition={initialCondition} />
    );

    rerender(<Table id="V" cols={cols} rows={rows} initialCondition={initialCondition} />);
    expect(firstId(container)).toBe("21");
  });

  test("moving between pages is reported", () => {
    const { container, last } = renderTable({
      initialCondition: { pagination: { rowCountPerPage: 20 } },
    });

    const next = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("次へ"))!;
    fireEvent.click(next);
    expect(last().pagination.page).toBe(2);
  });

  test("a later change in the rows still goes back to page 1", () => {
    const initialCondition = { pagination: { rowCountPerPage: 20 as const, page: 3 } };
    const { container, rerender } = render(
      <Table id="V" cols={cols} rows={rows} initialCondition={initialCondition} />
    );

    rerender(<Table id="V" cols={cols} rows={rows.slice(0, 50)} initialCondition={initialCondition} />);
    expect(firstId(container)).toBe("1");
  });

  test('"all" is reported as page 1', () => {
    const { last } = renderTable({ initialCondition: { pagination: { rowCountPerPage: "all" } } });
    expect(last().pagination).toEqual({ rowCountPerPage: "all", page: 1 });
  });
});

describe("column widths", () => {
  const cellWidth = (col: number) =>
    window.getComputedStyle(document.getElementById(`ReactUI:Table:V:Cell-0-${col}`)!).width;

  test("a drag is reported when it ends, not while dragging", () => {
    const { container, reports, last } = renderTable();
    const handle = container.querySelector(".cursor-col-resize")!;

    const before = reports.length;
    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 150 });
    fireEvent.mouseMove(document, { clientX: 200 });
    expect(reports.length).toBe(before); // nothing while dragging

    act(() => {
      fireEvent.mouseUp(document);
    });
    expect(reports.length).toBe(before + 1);
    expect(last().columnWidths).toEqual({ name: 250 });
  });

  test("widths in initialCondition are applied and reported", () => {
    const { last } = renderTable({ initialCondition: { columnWidths: { age: 320 } } });

    expect(cellWidth(0)).toBe("150px");
    expect(cellWidth(1)).toBe("320px");
    expect(last().columnWidths).toEqual({ age: 320 });
  });
});

test("a saved condition (through JSON) restores page and widths", () => {
  const first = renderTable({
    initialCondition: { pagination: { rowCountPerPage: 20, page: 2 }, columnWidths: { name: 260 } },
  });
  const saved = JSON.parse(JSON.stringify(first.last()));
  first.unmount();

  const second = renderTable({ initialCondition: saved });
  expect(firstId(second.container)).toBe("21");
  expect(window.getComputedStyle(document.getElementById("ReactUI:Table:V:Cell-0-0")!).width).toBe("260px");
});
