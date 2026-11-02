import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { DataObject, DataRecord, TPropsTable, TTableColumn } from "../table/type";
import { canEmpty } from "./bulk";

type Row = { name: string; code: string; dept: string; age: number; memo: string };

const done = (_k: string, _v: unknown, _r: unknown, complete: () => void) => complete();
const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前", editable: true, onCellBlur: done },
  // Cannot be empty: at least one character.
  { key: "code", type: "string", label: "コード", editable: true, onCellBlur: done, constraints: { minLength: 1 } },
  {
    key: "dept",
    type: "select",
    label: "部署",
    editable: true,
    onCellBlur: done,
    allowEmpty: true,
    options: [
      { value: "s", label: "営業" },
      { value: "d", label: "開発" },
    ],
  },
  { key: "age", type: "number", label: "年齢", editable: true, onCellBlur: done },
  { key: "memo", type: "string", label: "メモ" }, // read-only
] as TTableColumn<Row>[];

const rows: DataObject<Row>[] = [
  { id: "1", name: "a", code: "A1", dept: "s", age: 30, memo: "m1" },
  { id: "2", name: "b", code: "B2", dept: "d", age: 40, memo: "m2" },
  { id: "3", name: "c", code: "C3", dept: "", age: 50, memo: "m3" },
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

const cellId = (r: number, c: number) => `ReactUI:Table:BE:Cell-${r}-${c}`;

function renderTable(props: Partial<TPropsTable<Row>> = {}) {
  return render(<Table id="BE" cols={cols} rows={rows} {...props} />);
}

function select(from: [number, number], to: [number, number]) {
  act(() => {
    fireEvent.mouseDown(document.getElementById(cellId(...from))!);
    jest.runAllTimers();
    fireEvent.mouseEnter(document.getElementById(cellId(...to))!);
    fireEvent.mouseUp(document);
  });
}

function press(key: string, init: KeyboardEventInit = {}) {
  let event!: KeyboardEvent;
  act(() => {
    event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    document.body.dispatchEvent(event);
    jest.runAllTimers();
  });
  return event;
}

const editorOpen = () => !!document.getElementById("ReactUI:Table:BE:Editor");

// canEmpty works on columns as the table holds them inside.
const asCol = (col: unknown) => col as TTableColumn<DataRecord>;

describe("canEmpty", () => {
  test.each([
    ["editable text", cols[0], true],
    ["text with minLength", cols[1], false],
    ["select with allowEmpty", cols[2], true],
    ["number", cols[3], false],
    ["read-only", cols[4], false],
  ])("%s", (_name, col, expected) => {
    expect(canEmpty(asCol(col))).toBe(expected);
  });

  test("text whose pattern rejects empty text", () => {
    const col = asCol({ ...cols[0], constraints: { pattern: "^[0-9]+$" } });
    expect(canEmpty(col)).toBe(false);
    const optional = asCol({ ...cols[0], constraints: { pattern: "^[0-9]*$" } });
    expect(canEmpty(optional)).toBe(true);
  });
});

describe("Delete on several cells", () => {
  test("empties the cells that can be empty, passing each row to onUpdateRow", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow });
    select([0, 0], [1, 4]);

    const event = press("Delete");

    expect(event.defaultPrevented).toBe(true);
    expect(onUpdateRow.mock.calls).toEqual([
      [{ ...rows[0], name: "", dept: "" }, rows[0]],
      [{ ...rows[1], name: "", dept: "" }, rows[1]],
    ]);
    expect(editorOpen()).toBe(false);
  });

  test("Backspace does the same", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow });
    select([0, 0], [1, 0]);
    press("Backspace");
    expect(onUpdateRow).toHaveBeenCalledTimes(2);
  });

  test("rows already empty are not passed", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow });
    select([1, 2], [2, 2]); // dept of row 3 is already empty
    press("Delete");
    expect(onUpdateRow.mock.calls).toEqual([[{ ...rows[1], dept: "" }, rows[1]]]);
  });

  test("one cell is still edited, starting empty", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow });
    select([0, 0], [0, 0]);
    press("Delete");
    expect(onUpdateRow).not.toHaveBeenCalled();
    expect(editorOpen()).toBe(true);
  });

  test("without onUpdateRow, it edits the first cell as before", () => {
    renderTable();
    select([0, 0], [1, 0]);
    press("Delete");
    expect(editorOpen()).toBe(true);
  });
});

describe("Ctrl+D (fill down)", () => {
  test("copies the top row to the rows below, in editable columns", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow });
    select([0, 2], [2, 4]); // 部署, 年齢, メモ (read-only)

    const event = press("d", { ctrlKey: true });

    expect(event.defaultPrevented).toBe(true);
    expect(onUpdateRow.mock.calls).toEqual([
      [{ ...rows[1], dept: "s", age: 30 }, rows[1]],
      [{ ...rows[2], dept: "s", age: 30 }, rows[2]],
    ]);
  });

  test("Cmd+D works too", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow });
    select([0, 0], [1, 0]);
    press("d", { metaKey: true });
    expect(onUpdateRow.mock.calls).toEqual([[{ ...rows[1], name: "a" }, rows[1]]]);
  });

  test("uses the rows as shown (sorted)", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow, initialCondition: { sort: { key: "age", asc: false } } });
    select([0, 0], [1, 0]); // shown: c (50), b (40)
    press("d", { ctrlKey: true });
    expect(onUpdateRow.mock.calls).toEqual([[{ ...rows[1], name: "c" }, rows[1]]]);
  });

  test("one row selected: nothing happens and the browser keeps the key", () => {
    const onUpdateRow = jest.fn();
    renderTable({ onUpdateRow });
    select([0, 0], [0, 3]);
    const event = press("d", { ctrlKey: true });
    expect(onUpdateRow).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  test("without onUpdateRow nothing happens", () => {
    renderTable();
    select([0, 0], [1, 0]);
    const event = press("d", { ctrlKey: true });
    expect(event.defaultPrevented).toBe(false);
  });
});
