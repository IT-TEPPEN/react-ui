import { act, cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = { name: string };

const onCellBlur = jest.fn();
const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前", editable: true, onCellBlur },
];
const rows = [
  { id: "1", name: "a" },
  { id: "2", name: "b" },
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
  jest.clearAllMocks();
});

function selectCell(cell: Element) {
  act(() => {
    fireEvent.mouseDown(cell);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
}

function pressKey(target: Element, init: KeyboardEventInit) {
  let notPrevented = true;
  act(() => {
    notPrevented = fireEvent.keyDown(target, init);
    jest.runAllTimers();
  });
  return notPrevented;
}

function paste(target: Element, text: string) {
  const event = createEvent.paste(target, {
    clipboardData: { getData: () => text },
  });
  act(() => {
    fireEvent(target, event);
  });
  return event;
}

const editors = (container: HTMLElement) =>
  container.querySelectorAll('input[id$=":Editor"]');

describe("table ids", () => {
  test("tables without an id get different element ids", () => {
    const { container } = render(
      <>
        <Table cols={cols} rows={rows} />
        <Table cols={cols} rows={rows} />
      </>
    );

    const ids = Array.from(container.querySelectorAll("td[id$='Cell-0-0']")).map(
      (td) => td.id
    );
    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });

  test("a cell in the second table without an id can be edited", () => {
    const { container } = render(
      <>
        <Table cols={cols} rows={rows} />
        <Table cols={cols} rows={rows} />
      </>
    );
    const secondCell = container.querySelectorAll("td[id$='Cell-0-0']")[1];

    const secondTable = secondCell.closest("table")!.parentElement!;

    selectCell(secondCell);
    pressKey(document.body, { key: "x" });

    expect(editors(container)).toHaveLength(1);
    expect(secondTable.contains(editors(container)[0])).toBe(true);
  });
});

describe("keyboard", () => {
  test("typing on a selected cell starts editing", () => {
    const { container } = render(<Table id="K" cols={cols} rows={rows} />);

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);
    pressKey(document.body, { key: "x" });

    expect(editors(container)).toHaveLength(1);
  });

  test("typing in another input is not taken over by the table", () => {
    const { container, getByTestId } = render(
      <>
        <Table id="K" cols={cols} rows={rows} />
        <input data-testid="other" />
      </>
    );

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);
    // Focus moves without a mouse click, e.g. with the Tab key.
    const other = getByTestId("other");
    other.focus();

    expect(pressKey(other, { key: "x" })).toBe(true);
    expect(pressKey(other, { key: "ArrowDown" })).toBe(true);
    expect(pressKey(other, { key: "Backspace" })).toBe(true);
    expect(editors(container)).toHaveLength(0);
  });

  test("keys pressed during IME composition are ignored", () => {
    const { container } = render(<Table id="K" cols={cols} rows={rows} />);

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);
    expect(pressKey(document.body, { key: "Enter", isComposing: true })).toBe(
      true
    );
    pressKey(document.body, { key: "a", keyCode: 229 });

    expect(editors(container)).toHaveLength(0);
  });

  test("Cmd+C copies on macOS", () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<Table id="K" cols={cols} rows={rows} />);

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);
    pressKey(document.body, { key: "c", metaKey: true });

    expect(writeText).toHaveBeenCalledWith("a");
  });
  test("Cmd+V is left to the browser so that it can paste on macOS", () => {
    const { container } = render(<Table id="K" cols={cols} rows={rows} />);

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);

    expect(pressKey(document.body, { key: "v", metaKey: true })).toBe(true);
    expect(editors(container)).toHaveLength(0);
  });
});

describe("paste", () => {
  test("pastes into the selected cell", () => {
    const onUpdateRow = jest.fn();
    render(<Table id="K" cols={cols} rows={rows} onUpdateRow={onUpdateRow} />);

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);
    const event = paste(document.body, "z");

    expect(event.defaultPrevented).toBe(true);
    expect(onUpdateRow).toHaveBeenCalledWith(
      { id: "1", name: "z" },
      { id: "1", name: "a" }
    );
  });

  test("pasting into the cell editor is left to the editor", () => {
    const onUpdateRow = jest.fn();
    const { container } = render(
      <Table id="K" cols={cols} rows={rows} onUpdateRow={onUpdateRow} />
    );

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);
    pressKey(document.body, { key: "F2" });
    const editor = editors(container)[0];
    const event = paste(editor, "z");

    expect(event.defaultPrevented).toBe(false);
    expect(onUpdateRow).not.toHaveBeenCalled();
  });

  test("pasting into another input is not taken over by the table", () => {
    const onUpdateRow = jest.fn();
    const { getByTestId } = render(
      <>
        <Table id="K" cols={cols} rows={rows} onUpdateRow={onUpdateRow} />
        <textarea data-testid="other" />
      </>
    );

    selectCell(document.getElementById("ReactUI:Table:K:Cell-0-0")!);
    const event = paste(getByTestId("other"), "z");

    expect(event.defaultPrevented).toBe(false);
    expect(onUpdateRow).not.toHaveBeenCalled();
  });
});
