import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../../table/base";
import { DataObject, TPropsTable, TTableColumn } from "../../table/type";

type Row = { name: string; kana: string; dept: string; age: number };

const rows: DataObject<Row>[] = [
  { id: "1", name: "佐藤", kana: "さとう", dept: "s", age: 30 },
  { id: "2", name: "鈴木", kana: "すずき", dept: "d", age: 40 },
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
  jest.restoreAllMocks();
});

function setup(props: Partial<TPropsTable<Row>> = {}) {
  const onCellBlur = jest.fn((_k, _v, _r, done: () => void) => done());
  const cols = [
    { key: "name", type: "string", label: "氏名", editable: true, onCellBlur, constraints: { maxLength: 5 } },
    { key: "kana", type: "string", label: "かな" },
    {
      key: "dept",
      type: "select",
      label: "部署",
      editable: true,
      onCellBlur,
      options: [
        { value: "s", label: "営業部" },
        { value: "d", label: "開発部" },
        { value: "a", label: "総務部" },
      ],
    },
    { key: "age", type: "number", label: "年齢", editable: true, onCellBlur, constraints: { max: 150 } },
  ] as TTableColumn<Row>[];
  const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
  const utils = render(<Table id="D" cols={cols} rows={rows} {...props} />);
  return { ...utils, onCellBlur, alert };
}

const part = (name: string) => document.querySelector(`[data-teppen-part="${name}"]`);
const editor = () => document.getElementById("ReactUI:Table:D:Editor") as HTMLInputElement;

function select(r: number, c: number) {
  act(() => {
    fireEvent.mouseDown(document.getElementById(`ReactUI:Table:D:Cell-${r}-${c}`)!);
    fireEvent.mouseUp(document);
    jest.runAllTimers();
  });
}

function key(k: string, init: KeyboardEventInit = {}) {
  act(() => {
    fireEvent.keyDown(document.activeElement ?? document.body, { key: k, ...init });
    jest.runAllTimers();
  });
}

function edit(r: number, c: number) {
  select(r, c);
  key("F2");
}

describe("editing a cell", () => {
  test("shows the keys to use under the cell, and no cancel button", () => {
    setup();
    edit(0, 0);

    expect(part("editor")).not.toBeNull();
    expect(part("edit-hint")?.textContent).toContain("Enter");
    expect(part("edit-hint")?.textContent).toContain("Esc");
    expect(part("editor")!.querySelector("button")).toBeNull();
  });

  test("an invalid value is shown under the cell, without an alert; Esc restores it", () => {
    const { alert, onCellBlur } = setup();
    edit(0, 3);
    fireEvent.change(editor(), { target: { value: "200" } });
    key("Enter");

    expect(alert).not.toHaveBeenCalled();
    expect(onCellBlur).not.toHaveBeenCalled();
    expect(part("editor")!.hasAttribute("data-invalid")).toBe(true);
    expect(part("edit-error")?.textContent).toContain("150以下で入力してください");

    // Typing again clears the error.
    fireEvent.change(editor(), { target: { value: "20" } });
    expect(part("edit-error")).toBeNull();

    key("Escape");
    expect(part("editor")).toBeNull();
    expect(document.getElementById("ReactUI:Table:D:Cell-0-3")!.textContent).toBe("30");
  });

  test("with an errorHandler, the app shows the error; the cell is still marked", () => {
    const errorHandler = jest.fn();
    const { alert } = setup({ errorHandler });
    edit(0, 0);
    fireEvent.change(editor(), { target: { value: "とても長い名前" } });
    key("Enter");

    expect(errorHandler).toHaveBeenCalledTimes(1);
    expect(alert).not.toHaveBeenCalled();
    expect(part("editor")!.hasAttribute("data-invalid")).toBe(true);
    expect(part("edit-error")?.textContent).toContain("Esc");
  });

  test("a saved cell lights up for a moment", () => {
    setup();
    edit(0, 0);
    fireEvent.change(editor(), { target: { value: "佐藤花子" } });
    act(() => {
      fireEvent.keyDown(editor(), { key: "Enter" });
    });

    expect(part("saved")).not.toBeNull();
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(part("saved")).toBeNull();
  });

  test("an unchanged value is not marked as saved", () => {
    setup();
    edit(0, 0);
    key("Enter");
    expect(part("saved")).toBeNull();
  });
});

describe("read-only columns", () => {
  test("typing on one says that it cannot be edited", () => {
    setup();
    select(0, 1);
    key("a");

    expect(editor()).toBeNull();
    expect(part("read-only-note")?.textContent).toBe("この列は編集できません");
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(part("read-only-note")).toBeNull();
  });

  test("its selected cell gets a gray frame", () => {
    setup();
    select(0, 1);
    expect(part("selection")!.hasAttribute("data-read-only")).toBe(true);
    select(0, 0);
    expect(part("selection")!.hasAttribute("data-read-only")).toBe(false);
  });
});

describe("select cells", () => {
  const options = () =>
    Array.from(document.querySelectorAll('[data-teppen-part="editor-options"] [role="option"]')).map(
      (o) => o.textContent
    );

  test("open the options under the cell with the current one checked", () => {
    setup();
    edit(0, 2);
    expect(options()).toEqual(["営業部✓", "開発部", "総務部"]);
  });

  test("↓ and Enter save the next option", () => {
    const { onCellBlur } = setup();
    edit(0, 2);
    key("ArrowDown");
    key("Enter");
    expect(onCellBlur.mock.calls[0][1]).toBe("d");
    expect(part("saved")).not.toBeNull();
  });

  test("typing filters the options", () => {
    const { onCellBlur } = setup();
    edit(0, 2);
    fireEvent.change(editor(), { target: { value: "総務" } });
    expect(options()).toEqual(["総務部"]);
    key("Enter");
    expect(onCellBlur.mock.calls[0][1]).toBe("a");
  });

  test("Esc and leaving the cell change nothing", () => {
    const { onCellBlur } = setup();
    edit(0, 2);
    key("ArrowDown");
    key("Escape");
    expect(part("editor")).toBeNull();

    edit(1, 2);
    act(() => {
      fireEvent.blur(editor());
    });
    expect(part("editor")).toBeNull();
    expect(onCellBlur).not.toHaveBeenCalled();
  });
});

test("a quick click (mouse up before the selection starts) does not leave a drag going", () => {
  const onUpdateRow = jest.fn();
  setup({ onUpdateRow });
  const cell = (r: number) => document.getElementById(`ReactUI:Table:D:Cell-${r}-0`)!;
  act(() => {
    fireEvent.mouseDown(cell(0));
    fireEvent.mouseUp(document); // before the timer that starts the selection
    jest.runAllTimers();
  });
  // Moving over another cell must not extend the selection...
  act(() => {
    fireEvent.mouseEnter(cell(1));
  });
  // ...so Delete edits the one cell instead of emptying two.
  key("Delete");
  expect(onUpdateRow).not.toHaveBeenCalled();
  expect(editor()).not.toBeNull();
});
