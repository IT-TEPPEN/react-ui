import { act, cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = { name: string };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前", editable: true, onCellBlur: jest.fn() },
];
const rows = [{ id: "1", name: "a" }];

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

function selectFirstCell() {
  const cell = document.getElementById("ReactUI:Table:P:Cell-0-0")!;
  act(() => {
    fireEvent.mouseDown(cell);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
}

function paste(text: string) {
  const event = createEvent.paste(document.body, {
    clipboardData: { getData: () => text },
  });
  act(() => {
    fireEvent(document.body, event);
  });
  return event;
}

describe("paste", () => {
  test("reports data that does not fit to onPasteError", () => {
    const onPasteError = jest.fn();
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(
      <Table
        id="P"
        cols={cols}
        rows={rows}
        onUpdateRow={jest.fn()}
        onPasteError={onPasteError}
      />
    );

    selectFirstCell();
    paste("x\ny");

    expect(onPasteError).toHaveBeenCalledTimes(1);
    expect(onPasteError.mock.calls[0][0].type).toBe("NOT_ENOUGH_ROWS");
    expect(alert).not.toHaveBeenCalled();
  });

  test("shows an alert once when onPasteError is not given", () => {
    const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
    render(<Table id="P" cols={cols} rows={rows} onUpdateRow={jest.fn()} />);

    selectFirstCell();
    paste("x\ty");

    expect(alert).toHaveBeenCalledTimes(1);
  });

  test("calls the latest onUpdateRow", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = render(
      <Table id="P" cols={cols} rows={rows} onUpdateRow={first} />
    );
    rerender(<Table id="P" cols={cols} rows={rows} onUpdateRow={second} />);

    selectFirstCell();
    paste("z");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith({ id: "1", name: "z" }, rows[0]);
  });

  test("without onUpdateRow the paste is left to the browser", () => {
    render(<Table id="P" cols={cols} rows={rows} />);

    selectFirstCell();
    expect(paste("z").defaultPrevented).toBe(false);
  });
});

describe("paste into a range selected in any direction", () => {
  type Row2 = { a: string; b: string };
  const cols2: TTableColumn<Row2>[] = [
    { key: "a", type: "string", label: "A", editable: true, onCellBlur: jest.fn() },
    { key: "b", type: "string", label: "B", editable: true, onCellBlur: jest.fn() },
  ];
  const rows2 = [
    { id: "1", a: "", b: "" },
    { id: "2", a: "", b: "" },
    { id: "3", a: "", b: "" },
  ];
  const cell = (r: number, c: number) =>
    document.getElementById(`ReactUI:Table:P:Cell-${r}-${c}`)!;

  function selectAndPaste(from: [number, number], to: [number, number], text: string) {
    const onUpdateRow = jest.fn();
    render(<Table id="P" cols={cols2} rows={rows2} onUpdateRow={onUpdateRow} />);
    act(() => {
      fireEvent.mouseDown(cell(...from));
      jest.runAllTimers();
      fireEvent.mouseEnter(cell(...to));
      fireEvent.mouseUp(document);
    });
    paste(text);
    return onUpdateRow.mock.calls.map(([newRow]) => newRow);
  }

  test("bottom-up selection fills every selected row", () => {
    expect(selectAndPaste([2, 0], [0, 0], "x")).toEqual([
      { id: "1", a: "x", b: "" },
      { id: "2", a: "x", b: "" },
      { id: "3", a: "x", b: "" },
    ]);
  });

  test("right-to-left selection starts from the leftmost column", () => {
    expect(selectAndPaste([0, 1], [0, 0], "x\ty")).toEqual([
      { id: "1", a: "x", b: "y" },
    ]);
  });

  test("it gives the same result as a top-down selection", () => {
    const bottomUp = selectAndPaste([2, 1], [1, 0], "p\tq");
    cleanup();
    const topDown = selectAndPaste([1, 0], [2, 1], "p\tq");
    expect(bottomUp).toEqual(topDown);
  });
});
