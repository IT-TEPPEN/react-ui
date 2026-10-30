import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

afterEach(cleanup);

type Row = { name: string; age: number; note: string; fixed: string };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前" },
  { key: "age", type: "number", label: "年齢" },
  { key: "note", type: "string", label: "備考", render: (v) => <b>{v}</b> },
  { key: "fixed", type: "string", label: "固定", disableSort: true },
];

const rows = [
  { id: "1", name: "b", age: 30, note: "x", fixed: "" },
  { id: "2", name: "c", age: 10, note: "y", fixed: "" },
  { id: "3", name: "a", age: 20, note: "z", fixed: "" },
];

// The sort button of each column, by column label.
function sortButtons(container: HTMLElement) {
  const result: { [label: string]: Element | null } = {};
  container.querySelectorAll("p.font-bold").forEach((label) => {
    const header = label.closest("div.relative")!;
    result[label.textContent!] = header.querySelector("div.cursor-pointer");
  });
  return result;
}

const renderedNames = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("tbody tr[data-testid]")).map(
    (tr) => tr.getAttribute("data-testid")
  );

describe("sortable columns", () => {
  test("every column can be sorted unless it sets disableSort", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);
    const buttons = sortButtons(container);

    expect(buttons["名前"]).not.toBeNull();
    expect(buttons["年齢"]).not.toBeNull();
    expect(buttons["備考"]).not.toBeNull();
    expect(buttons["固定"]).toBeNull();
  });

  test("a column with render is sorted by its value", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    fireEvent.click(sortButtons(container)["備考"]!);
    expect(renderedNames(container)).toEqual(["1", "2", "3"]);

    fireEvent.click(sortButtons(container)["備考"]!);
    expect(renderedNames(container)).toEqual(["3", "2", "1"]);
  });

  test("sorting a read-only column orders the rows", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    fireEvent.click(sortButtons(container)["年齢"]!);
    expect(renderedNames(container)).toEqual(["2", "3", "1"]);

    fireEvent.click(sortButtons(container)["名前"]!);
    expect(renderedNames(container)).toEqual(["3", "1", "2"]);
  });
});
