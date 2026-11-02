import { act, cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn } from "../table/type";

// Copy and paste work on the rows and columns as shown: sorted, on the
// current page, without hidden columns.

type Row = { name: string; dept: string; score: number };

const noop = (_k: string, _v: unknown, _r: unknown, done: () => void) => done();
const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前", editable: true, onCellBlur: noop },
  { key: "dept", type: "string", label: "部署", editable: true, onCellBlur: noop },
  { key: "score", type: "number", label: "点数", editable: true, onCellBlur: noop },
];
const rows = [
  { id: "1", name: "a", dept: "x", score: 30 },
  { id: "2", name: "b", dept: "y", score: 10 },
  { id: "3", name: "c", dept: "z", score: 20 },
];

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

const cellId = (r: number, c: number) => `ReactUI:Table:S:Cell-${r}-${c}`;

function renderTable(props: Partial<TPropsTable<Row>> = {}) {
  return render(<Table id="S" cols={cols} rows={rows} {...props} />);
}

function select(from: [number, number], to: [number, number]) {
  act(() => {
    fireEvent.mouseDown(document.getElementById(cellId(...from))!);
    jest.runAllTimers();
    fireEvent.mouseEnter(document.getElementById(cellId(...to))!);
    fireEvent.mouseUp(document);
  });
}

function copy() {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  act(() => {
    fireEvent.keyDown(document.body, { key: "c", ctrlKey: true });
  });
  return writeText;
}

function paste(text: string) {
  const event = createEvent.paste(document.body, {
    clipboardData: { getData: () => text },
  });
  act(() => {
    fireEvent(document.body, event);
  });
}

describe("copy", () => {
  test("copies sorted rows in the shown order", () => {
    renderTable({ initialCondition: { sort: { key: "score", asc: true } } });
    select([0, 0], [2, 0]);
    expect(copy()).toHaveBeenCalledWith("b\nc\na");
  });

  test("copies the rows of the current page", () => {
    renderTable({
      initialCondition: { pagination: { rowCountPerPage: 2, page: 2 } },
    });
    select([0, 0], [0, 2]);
    expect(copy()).toHaveBeenCalledWith("c\tz\t20");
  });

  test("skips hidden columns", () => {
    renderTable({ initialCondition: { hiddenColumns: ["dept"] } });
    select([0, 0], [0, 1]);
    expect(copy()).toHaveBeenCalledWith("a\t30");
  });

  test("copies rows that changed after the first render", () => {
    const { rerender } = renderTable();
    rerender(
      <Table
        id="S"
        cols={cols}
        rows={rows.map((row) => ({ ...row, name: row.name.toUpperCase() }))}
      />
    );
    select([0, 0], [1, 0]);
    expect(copy()).toHaveBeenCalledWith("A\nB");
  });
});

describe("paste", () => {
  test("updates the shown row (sorted, on the current page)", () => {
    const onUpdateRow = jest.fn();
    renderTable({
      onUpdateRow,
      initialCondition: {
        sort: { key: "score", asc: true },
        pagination: { rowCountPerPage: 2, page: 2 },
      },
    });
    // Page 2 of rows sorted by score: only "a" (30).
    select([0, 0], [0, 0]);
    paste("new");
    expect(onUpdateRow).toHaveBeenCalledWith(
      { id: "1", name: "new", dept: "x", score: 30 },
      rows[0]
    );
  });

  test("pastes into the shown columns, skipping hidden ones", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow, initialCondition: { hiddenColumns: ["dept"] } });
    select([0, 0], [0, 0]);
    paste("n\t99");
    expect(onUpdateRow).toHaveBeenCalledWith(
      { id: "1", name: "n", dept: "x", score: 99 },
      rows[0]
    );
  });
});
