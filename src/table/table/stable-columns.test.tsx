import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import Table from "./base";
import { DataObject, TTableColumn } from "./type";

// Apps often define cols inline: a new array and new functions on every
// render. The table should then only redraw what changed, while still
// calling the latest callbacks and showing what a new render returns.

type Row = { name: string; score: number };

const rows: DataObject<Row>[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i + 1),
  name: `n${i + 1}`,
  score: i,
}));

beforeAll(() => {
  // jsdom does not implement scrollIntoView.
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

// Called while a row is drawn; the same function on every render, so it
// does not cause redraws itself.
const drawn: string[] = [];
const countDraws = (row: DataObject<Row>) => {
  drawn.push(String(row.id));
  return "";
};

type TOnCellBlur = (
  key: string,
  value: string,
  current: DataObject<Row>,
  completeEditing: () => void
) => void;

function inlineCols(onCellBlur: TOnCellBlur = () => {}): TTableColumn<Row>[] {
  return [
    { key: "name", type: "string", label: "名前", editable: true, onCellBlur },
    { key: "score", type: "number", label: "点数" },
  ] as TTableColumn<Row>[];
}

function editFirstCell(value: string) {
  const cell = document.getElementById("ReactUI:Table:ST:Cell-0-0")!;
  act(() => {
    fireEvent.mouseDown(cell);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
  act(() => {
    fireEvent.keyDown(document.body, { key: "F2" });
  });
  const input = document.getElementById(
    "ReactUI:Table:ST:Editor"
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
}

test("with inline cols, updating one row redraws only that row", () => {
  const { rerender } = render(
    <Table id="ST" cols={inlineCols()} rows={rows} applyRowFormatting={countDraws} />
  );
  drawn.length = 0;

  const updated = rows.map((row) => (row.id === "3" ? { ...row, score: 99 } : row));
  rerender(
    <Table id="ST" cols={inlineCols()} rows={updated} applyRowFormatting={countDraws} />
  );

  expect(drawn).toEqual(["3"]);
});

test("a new onClickRow function does not redraw the rows", () => {
  const { rerender } = render(
    <Table id="ST" cols={inlineCols()} rows={rows} applyRowFormatting={countDraws} onClickRow={() => {}} />
  );
  drawn.length = 0;
  const latest = jest.fn();
  rerender(
    <Table id="ST" cols={inlineCols()} rows={rows} applyRowFormatting={countDraws} onClickRow={latest} />
  );
  expect(drawn).toEqual([]);

  // ...but a click calls the latest one.
  fireEvent.click(document.querySelector('tbody tr[data-testid="2"]')!);
  expect(latest).toHaveBeenCalledWith(rows[1]);
});

test("the latest onCellBlur is called", () => {
  const first = jest.fn((_k, _v, _r, done) => done());
  const latest = jest.fn((_k, _v, _r, done) => done());
  const { rerender } = render(<Table id="ST" cols={inlineCols(first)} rows={rows} />);
  rerender(<Table id="ST" cols={inlineCols(latest)} rows={rows} />);

  editFirstCell("changed");

  expect(first).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledTimes(1);
  expect(latest.mock.calls[0][1]).toBe("changed");
});

test("a new render function is shown", () => {
  // e.g. render reads a list of names that the app loads later
  const withRender = (suffix: string): TTableColumn<Row>[] => [
    { key: "name", type: "string", label: "名前", render: (v) => `${v}${suffix}` },
  ];
  const { container, rerender } = render(
    <Table id="ST" cols={withRender("")} rows={rows} />
  );
  rerender(<Table id="ST" cols={withRender("さん")} rows={rows} />);

  expect(container.querySelector("tbody td[id$='Cell-0-0']")!.textContent).toBe("n1さん");
});

test("a changed label is shown", () => {
  const { container, rerender } = render(<Table id="ST" cols={inlineCols()} rows={rows} />);
  const renamed = inlineCols();
  renamed[1] = { ...renamed[1], label: "得点" };
  rerender(<Table id="ST" cols={renamed} rows={rows} />);

  const labels = Array.from(container.querySelectorAll('[data-teppen-part="header"] p')).map(
    (p) => p.textContent
  );
  expect(labels).toContain("得点");
});

test("checkboxes follow app state read by checked", () => {
  function App() {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <>
        <button onClick={() => setSelected(["2"])}>select 2</button>
        <Table
          id="ST"
          cols={inlineCols()}
          rows={rows}
          checkbox={{
            checked: (row) => selected.includes(String(row.id)),
            onChecked: () => {},
            onUnchecked: () => {},
          }}
        />
      </>
    );
  }
  const { container, getByText } = render(<App />);
  const boxes = () =>
    Array.from(container.querySelectorAll('tbody input[type="checkbox"]')).map(
      (input) => (input as HTMLInputElement).checked
    );
  expect(boxes()).toEqual([false, false, false, false, false]);

  fireEvent.click(getByText("select 2"));
  expect(boxes()).toEqual([false, true, false, false, false]);
});

test("the latest checkbox callbacks are called", () => {
  const first = jest.fn();
  const latest = jest.fn();
  const checkbox = (onChecked: jest.Mock) => ({
    checked: () => false,
    onChecked,
    onUnchecked: () => {},
  });
  const { container, rerender } = render(
    <Table id="ST" cols={inlineCols()} rows={rows} checkbox={checkbox(first)} />
  );
  rerender(<Table id="ST" cols={inlineCols()} rows={rows} checkbox={checkbox(latest)} />);

  fireEvent.click(container.querySelector('tbody input[type="checkbox"]')!);
  expect(first).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledWith(rows[0]);
});
