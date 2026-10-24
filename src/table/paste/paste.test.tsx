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
