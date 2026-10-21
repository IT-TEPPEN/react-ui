import { act, cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import Table from "./base";
import { TTableColumn } from "./type";

type Row = { name: string; born: Date };

const born = new Date(2000, 0, 1);
const row = { id: "1", name: "a", born };

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

function selectFirstCell() {
  const cell = document.getElementById("ReactUI:Table:R:Cell-0-0")!;
  act(() => {
    fireEvent.mouseDown(cell);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
  return cell;
}

describe("row objects passed to callbacks", () => {
  const cols = (onCellBlur = jest.fn()): TTableColumn<Row>[] => [
    { key: "name", type: "string", label: "名前", editable: true, onCellBlur },
    { key: "born", type: "date", label: "誕生日", render: (v) => v.toDateString() },
  ];

  test("onClickRow and applyRowFormatting receive the original row", () => {
    const onClickRow = jest.fn();
    const applyRowFormatting = jest.fn(() => "");
    const { getByTestId } = render(
      <Table
        id="R"
        cols={cols()}
        rows={[row]}
        onClickRow={onClickRow}
        applyRowFormatting={applyRowFormatting}
      />
    );

    fireEvent.click(getByTestId("1"));

    expect(onClickRow).toHaveBeenCalledTimes(1);
    expect(onClickRow.mock.calls[0][0]).toBe(row);
    expect(onClickRow.mock.calls[0][0].born).toBeInstanceOf(Date);
    expect(applyRowFormatting).toHaveBeenCalledWith(row);
  });

  test("checkbox callbacks receive the original row", () => {
    const onChecked = jest.fn();
    const { container } = render(
      <Table
        id="R"
        cols={cols()}
        rows={[row]}
        checkbox={{ checked: () => false, onChecked, onUnchecked: jest.fn() }}
      />
    );

    const checkbox = container.querySelector(
      'tbody input[type="checkbox"]'
    ) as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(onChecked).toHaveBeenCalledTimes(1);
    expect(onChecked.mock.calls[0][0]).toBe(row);
  });

  test("onCellBlur receives the original row as the current row", () => {
    const onCellBlur = jest.fn();
    render(<Table id="R" cols={cols(onCellBlur)} rows={[row]} />);

    selectFirstCell();
    act(() => {
      fireEvent.keyDown(document.body, { key: "F2" });
    });
    const input = document.getElementById(
      "ReactUI:Table:R:Editor"
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "b" } });
    fireEvent.blur(input);

    expect(onCellBlur).toHaveBeenCalledTimes(1);
    expect(onCellBlur.mock.calls[0][2]).toBe(row);
  });

  test("onUpdateRow receives the original row as the old row when pasting", () => {
    const onUpdateRow = jest.fn();
    render(<Table id="R" cols={cols()} rows={[row]} onUpdateRow={onUpdateRow} />);

    selectFirstCell();
    const event = createEvent.paste(document.body, {
      clipboardData: { getData: () => "z" },
    });
    act(() => {
      fireEvent(document.body, event);
    });

    expect(onUpdateRow).toHaveBeenCalledTimes(1);
    const [newRow, oldRow] = onUpdateRow.mock.calls[0];
    expect(oldRow).toBe(row);
    expect(newRow).toEqual({ ...row, name: "z" });
    expect(newRow.born).toBeInstanceOf(Date);
  });
});
