import { act, cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = { name: string; age: number; note: string };

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

const rows = [
  { id: "1", name: "a", age: 1, note: "x" },
  { id: "2", name: "b", age: 2, note: "y" },
];

function setup() {
  const onCellBlur = jest.fn((_k, _v, _row, done) => done());
  const onUpdateRow = jest.fn();
  const cols: TTableColumn<Row>[] = [
    { key: "name", type: "string", label: "名前", editable: true, onCellBlur },
    { key: "age", type: "number", label: "年齢", editable: true, onCellBlur },
    { key: "note", type: "string", label: "備考" },
  ];
  render(<Table id="K" cols={cols} rows={rows} onUpdateRow={onUpdateRow} />);
  return { onCellBlur, onUpdateRow };
}

const cell = (r: number, c: number) =>
  document.getElementById(`ReactUI:Table:K:Cell-${r}-${c}`)!;
const catcher = () =>
  document.querySelector("input[data-react-ui-key-catcher]") as HTMLInputElement | null;
const editor = () =>
  document.getElementById("ReactUI:Table:K:Editor") as HTMLInputElement | null;

function selectCell(r: number, c: number) {
  act(() => {
    fireEvent.mouseDown(cell(r, c));
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
}

// What the browser does when the user types with an IME and confirms it.
function composeAndConfirm(target: HTMLInputElement, text: string) {
  act(() => {
    fireEvent.keyDown(target, { key: "Process", keyCode: 229 });
    fireEvent.compositionStart(target, { data: "" });
    fireEvent.input(target, { target: { value: text } });
    fireEvent.keyDown(target, { key: "Enter", isComposing: true, keyCode: 229 });
    fireEvent.compositionEnd(target, { data: text });
    fireEvent.keyUp(target, { key: "Enter" });
  });
  // The editor opens first; the text is put into it on a later timer.
  act(() => {
    jest.runAllTimers();
  });
}

function commit(input: HTMLInputElement) {
  act(() => {
    fireEvent.keyDown(input, { key: "Enter" });
    jest.runAllTimers();
  });
}

describe("typing on a selected cell", () => {
  test("selecting a cell puts the focus on the key catcher", () => {
    setup();
    expect(catcher()).toBeNull();

    selectCell(0, 0);

    expect(catcher()).not.toBeNull();
    expect(document.activeElement).toBe(catcher());
  });

  test("Japanese input starts editing with the confirmed text", () => {
    const { onCellBlur } = setup();
    selectCell(0, 0);

    composeAndConfirm(catcher()!, "東京");

    expect(editor()!.value).toBe("東京");
    commit(editor()!);
    expect(onCellBlur).toHaveBeenCalledTimes(1);
    expect(onCellBlur.mock.calls[0][1]).toBe("東京");
  });

  test("the key catcher is shown over the cell while composing", () => {
    setup();
    selectCell(0, 0);
    const input = catcher()!;

    expect(input.className).toContain("opacity-0");
    act(() => {
      fireEvent.compositionStart(input, { data: "" });
    });
    expect(input.className).not.toContain("opacity-0");
  });

  test("Japanese input on a read-only column does not start editing", () => {
    setup();
    selectCell(0, 2);

    composeAndConfirm(catcher()!, "メモ");

    expect(editor()).toBeNull();
    expect(catcher()!.value).toBe("");
  });

  test("full-width digits typed with an IME go into a number cell", () => {
    const { onCellBlur } = setup();
    selectCell(0, 1);

    composeAndConfirm(catcher()!, "１２");
    commit(editor()!);

    expect(onCellBlur.mock.calls[0][1]).toBe(12);
  });

  test("symbols start editing too", () => {
    const { onCellBlur } = setup();
    selectCell(0, 1);

    act(() => {
      fireEvent.keyDown(catcher()!, { key: "-" });
    });
    act(() => {
      jest.runAllTimers();
    });
    expect(editor()!.value).toBe("-");

    fireEvent.change(editor()!, { target: { value: "-5" } });
    commit(editor()!);
    expect(onCellBlur.mock.calls[0][1]).toBe(-5);
  });

  test("the focus returns to the key catcher after editing", () => {
    setup();
    selectCell(0, 0);
    act(() => {
      fireEvent.keyDown(catcher()!, { key: "z" });
      jest.runAllTimers();
    });
    commit(editor()!);

    expect(editor()).toBeNull();
    expect(document.activeElement).toBe(catcher());
  });

  test("arrow keys, copy and paste still work while the key catcher has the focus", () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const { onUpdateRow } = setup();
    selectCell(0, 0);

    const notPrevented = fireEvent.keyDown(catcher()!, { key: "ArrowDown" });
    expect(notPrevented).toBe(false);

    act(() => {
      fireEvent.keyDown(catcher()!, { key: "c", ctrlKey: true });
    });
    expect(writeText).toHaveBeenCalledWith("b");

    const event = createEvent.paste(catcher()!, {
      clipboardData: { getData: () => "z" },
    });
    act(() => {
      fireEvent(catcher()!, event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(onUpdateRow).toHaveBeenCalledWith(
      { ...rows[1], name: "z" },
      rows[1]
    );
  });
});
