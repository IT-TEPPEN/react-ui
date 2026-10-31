import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = { a: string; b: string };

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

const rows = [
  { id: "1", a: "a1", b: "b1" },
  { id: "2", a: "a2", b: "b2" },
  { id: "3", a: "a3", b: "b3" },
];

function setup() {
  // Commits immediately, like an app that saves and calls completeEditing.
  const committed: string[] = [];
  const onCellBlur = jest.fn((key: string, value: string, row: { id: string | number }, done: () => void) => {
    committed.push(`${key}${row.id}=${value}`);
    done();
  });
  const cols: TTableColumn<Row>[] = [
    { key: "a", type: "string", label: "A", editable: true, onCellBlur, constraints: { maxLength: 5 } },
    { key: "b", type: "string", label: "B", editable: true, onCellBlur },
  ];
  jest.spyOn(window, "alert").mockImplementation(() => {});
  render(<Table id="T" cols={cols} rows={rows} />);
  return { committed, onCellBlur };
}

const editor = () =>
  document.getElementById("ReactUI:Table:T:Editor") as HTMLInputElement | null;

function selectCell(r: number, c: number) {
  act(() => {
    fireEvent.mouseDown(document.getElementById(`ReactUI:Table:T:Cell-${r}-${c}`)!);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
}

function key(init: KeyboardEventInit, target: Element = document.activeElement ?? document.body) {
  act(() => {
    fireEvent.keyDown(target, init);
    jest.runAllTimers();
  });
}

// Edits the selected cell: opens the editor, types and commits with `commitKey`.
function editSelected(value: string, commitKey: KeyboardEventInit = { key: "Enter" }) {
  key({ key: "F2" });
  const input = editor()!;
  fireEvent.change(input, { target: { value } });
  act(() => {
    // Enter / Tab blur the editor themselves, which commits the value.
    fireEvent.keyDown(input, commitKey);
    if (commitKey.key === "Escape") fireEvent.blur(input);
    jest.runAllTimers();
  });
}

describe("while a cell is selected", () => {
  test("Tab moves right, Shift+Tab left, Shift+Enter up", () => {
    const { committed } = setup();
    selectCell(1, 0);

    key({ key: "Tab" });
    editSelected("x", { key: "Escape" }); // just to find out where we are
    key({ key: "F2" });
    fireEvent.change(editor()!, { target: { value: "x" } });
    act(() => { fireEvent.blur(editor()!); jest.runAllTimers(); });
    expect(committed.pop()).toBe("b2=x");

    key({ key: "Tab", shiftKey: true });
    key({ key: "Enter", shiftKey: true });
    key({ key: "F2" });
    fireEvent.change(editor()!, { target: { value: "y" } });
    act(() => { fireEvent.blur(editor()!); jest.runAllTimers(); });
    expect(committed.pop()).toBe("a1=y");
  });
});

describe("while editing", () => {
  test("Enter commits and moves down; the next edit goes to the cell below", () => {
    const { committed } = setup();
    selectCell(0, 0);

    editSelected("x");
    editSelected("y");
    expect(committed).toEqual(["a1=x", "a2=y"]);
  });

  test("Tab commits and moves right; Shift+Enter commits and moves up", () => {
    const { committed } = setup();
    selectCell(1, 0);

    editSelected("x", { key: "Tab" });
    editSelected("y", { key: "Enter", shiftKey: true });
    editSelected("z");
    expect(committed).toEqual(["a2=x", "b2=y", "b1=z"]);
  });

  test("Enter without a change still moves down", () => {
    const { committed } = setup();
    selectCell(0, 1);

    editSelected("b1"); // unchanged: no commit, editing just ends
    editSelected("q");
    expect(committed).toEqual(["b2=q"]);
  });

  test("a value that fails validation does not move, even when committed later", () => {
    const { committed } = setup();
    selectCell(0, 0);

    key({ key: "F2" });
    const input = editor()!;
    fireEvent.change(input, { target: { value: "too long" } });
    act(() => {
      fireEvent.keyDown(input, { key: "Enter" });
      jest.runAllTimers(); // validation fails; the editor takes the focus back
    });
    act(() => {
      fireEvent.focus(input);
    });
    expect(editor()).not.toBeNull();
    expect(committed).toEqual([]);

    // Fixed and committed by leaving the field (not Enter / Tab): no move.
    fireEvent.change(input, { target: { value: "ok" } });
    act(() => { fireEvent.blur(input); jest.runAllTimers(); });
    editSelected("next");
    expect(committed).toEqual(["a1=ok", "a1=next"]);
  });
});
