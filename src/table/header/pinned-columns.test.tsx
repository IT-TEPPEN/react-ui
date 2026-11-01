import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn } from "../table/type";

type Row = { a: string; b: string; c: string; d: string };
const rows = [{ id: "1", a: "a", b: "b", c: "c", d: "d" }];

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

const cols = (pinned: (keyof Row)[]): TTableColumn<Row>[] =>
  (["a", "b", "c", "d"] as const).map((key, i) => ({
    key,
    type: "string",
    label: key.toUpperCase(),
    initialWidth: 100 + i * 10, // a 100, b 110, c 120, d 130
    pinned: pinned.includes(key),
  }));

const renderTable = (pinned: (keyof Row)[], props: Partial<TPropsTable<Row>> = {}) =>
  render(<Table id="P" cols={cols(pinned)} rows={rows} {...props} />);

const cellStyle = (col: number) =>
  window.getComputedStyle(document.getElementById(`ReactUI:Table:P:Cell-0-${col}`)!);
const headerCell = (label: string) =>
  Array.from(document.querySelectorAll('[data-teppen-part="header-cell"]')).find(
    (el) => el.textContent === label
  ) as HTMLElement;

describe("pinned columns", () => {
  test("stay at the left edge, each after the ones before it", () => {
    renderTable(["a", "b"]);

    expect(cellStyle(0).position).toBe("sticky");
    expect(cellStyle(0).left).toBe("0px");
    expect(cellStyle(1).position).toBe("sticky");
    expect(cellStyle(1).left).toBe("100px");
    expect(cellStyle(2).position).not.toBe("sticky");

    expect(headerCell("A").style.position).toBe("sticky");
    expect(headerCell("B").style.left).toBe("100px");
    expect(headerCell("C").style.position).toBe("");
  });

  test("the last pinned column draws the edge line", () => {
    renderTable(["a", "b"]);

    expect(cellStyle(0).boxShadow).toBe("");
    expect(cellStyle(1).boxShadow).toContain("inset -1px 0 0");
    expect(headerCell("B").style.boxShadow).toContain("inset -1px 0 0");
  });

  test("the checkbox column is pinned with them", () => {
    const { container } = renderTable(["a"], {
      checkbox: { checked: () => false, onChecked: () => {}, onUnchecked: () => {} },
    });

    const checkboxCell = container.querySelector("tbody td.table-col-checkbox")!;
    expect(window.getComputedStyle(checkboxCell).position).toBe("sticky");
    expect(cellStyle(0).left).toBe("32px");
  });

  test("a pinned column after an unpinned one is ignored with a warning", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    renderTable(["a", "c"]);

    expect(cellStyle(0).position).toBe("sticky");
    expect(cellStyle(2).position).not.toBe("sticky");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("c"));
  });

  test("keyboard moves scroll cells into view clear of the pinned columns", () => {
    renderTable(["a", "b"]);
    const body = document.getElementById("ReactUI:Table:P")!;
    expect(window.getComputedStyle(body).scrollPaddingLeft).toBe("210px");
  });

  test("resizing a pinned column moves the pinned columns after it", () => {
    const { container } = renderTable(["a", "b"]);
    const handle = container.querySelectorAll(".cursor-col-resize")[0];

    fireEvent.mouseDown(handle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 140 });
    fireEvent.mouseUp(document);

    expect(cellStyle(1).left).toBe("140px");
  });

  test("nothing is pinned by default", () => {
    renderTable([]);
    expect(cellStyle(0).position).not.toBe("sticky");
    expect(headerCell("A").style.position).toBe("");
  });
});
