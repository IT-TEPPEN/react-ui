import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = { status: string };

const cols: TTableColumn<Row>[] = [
  {
    key: "status",
    type: "select",
    label: "状態",
    options: [{ value: "open", label: "未対応" }],
  },
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

function copyColumn(rows: { id: string; status: string }[]) {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  render(<Table id="C" cols={cols} rows={rows} />);

  const first = document.getElementById("ReactUI:Table:C:Cell-0-0")!;
  const last = document.getElementById(`ReactUI:Table:C:Cell-${rows.length - 1}-0`)!;
  act(() => {
    fireEvent.mouseDown(first);
    jest.runAllTimers();
    fireEvent.mouseEnter(last);
    fireEvent.mouseUp(document);
  });
  act(() => {
    fireEvent.keyDown(document.body, { key: "c", ctrlKey: true });
  });

  return writeText;
}

describe("copying select columns", () => {
  test("copies the option label", () => {
    const writeText = copyColumn([{ id: "1", status: "open" }]);
    expect(writeText).toHaveBeenCalledWith("未対応");
  });

  test("copies the raw value when it is not one of the options", () => {
    const writeText = copyColumn([
      { id: "1", status: "open" },
      { id: "2", status: "archived" },
      { id: "3", status: "" },
    ]);
    expect(writeText).toHaveBeenCalledWith("未対応\narchived\n");
  });
});
