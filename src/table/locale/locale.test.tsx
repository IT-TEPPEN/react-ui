import { act, cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn } from "../table/type";

type Row = { name: string; role: string };

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

const cols: TTableColumn<Row>[] = [
  {
    key: "name",
    type: "string",
    label: "Name",
    editable: true,
    constraints: { maxLength: 3 },
    onCellBlur: (_k, _v, _r, done) => done(),
  },
  {
    key: "role",
    type: "select",
    label: "Role",
    editable: true,
    allowEmpty: true,
    options: [{ value: "1", label: "Admin" }],
    onCellBlur: (_k, _v, _r, done) => done(),
  },
];
const rows = [{ id: "1", name: "a", role: "1" }];

function setup(props: Partial<TPropsTable<Row>> = {}) {
  const alert = jest.spyOn(window, "alert").mockImplementation(() => {});
  const utils = render(<Table id="L" cols={cols} rows={rows} {...props} />);
  return { ...utils, alert };
}

function selectCell(c: number) {
  act(() => {
    fireEvent.mouseDown(document.getElementById(`ReactUI:Table:L:Cell-0-${c}`)!);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
}

function editName(value: string) {
  selectCell(0);
  act(() => {
    fireEvent.keyDown(document.body, { key: "F2" });
  });
  const input = document.getElementById("ReactUI:Table:L:Editor") as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
}

function paste(text: string) {
  const event = createEvent.paste(document.body, {
    clipboardData: { getData: () => text },
  });
  act(() => {
    fireEvent(document.body, event);
  });
}

describe("locale", () => {
  test("validation alerts are in Japanese by default, worded as before", () => {
    const { alert } = setup();
    editName("abcd");

    expect(alert).toHaveBeenCalledWith(
      "入力値が不正のため、エラーを確認し修正してください。\n\n" +
        "[対象の列名]: Name\n" +
        "[入力値]　　: abcd\n\n" +
        "[エラー内容]:\n・文字数が最大の長さ3文字を超えています。(現在4文字)"
    );
  });

  test('validation alerts are in English with locale="en"', () => {
    const { alert } = setup({ locale: "en" });
    editName("abcd");

    expect(alert).toHaveBeenCalledWith(
      "The value is not valid. Please check the errors and fix it.\n\n" +
        "[Column]: Name\n" +
        "[Value] : abcd\n\n" +
        "[Errors]:\n- Must be at most 3 characters (currently 4)."
    );
  });

  test("paste errors follow the locale", () => {
    const onPasteError = jest.fn();
    setup({ locale: "en", onUpdateRow: jest.fn(), onPasteError });

    selectCell(0);
    paste("x\ny");

    expect(onPasteError).toHaveBeenCalledWith({
      type: "NOT_ENOUGH_ROWS",
      message: "There are not enough rows to paste into.",
    });
  });

  test("the copied notice follows the locale", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    const { getByText } = setup({ locale: "en" });

    selectCell(0);
    act(() => {
      fireEvent.keyDown(document.body, { key: "c", ctrlKey: true });
    });

    expect(getByText("Copied")).toBeDefined();
  });

  test("the empty option of a select cell follows the locale", () => {
    const { getByText } = setup({ locale: "en" });

    selectCell(1);
    act(() => {
      fireEvent.keyDown(document.body, { key: "F2" });
    });

    expect(getByText("-- Clear --")).toBeDefined();
  });
});

describe("errorHandler", () => {
  test("the latest errorHandler is called", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender, alert } = setup({ errorHandler: first });
    rerender(<Table id="L" cols={cols} rows={rows} errorHandler={second} />);

    editName("abcd");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second.mock.calls[0][0][0].type).toBe("STRING_IS_TOO_LONG");
    expect(alert).not.toHaveBeenCalled();
  });
});
