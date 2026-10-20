import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../../table/base";

afterEach(cleanup);

function setup(initial: number) {
  const onCellBlur = jest.fn();
  const utils = render(
    <Table
      id="num"
      rows={[{ id: "1", price: initial }]}
      cols={[
        {
          key: "price",
          type: "number",
          label: "価格",
          editable: true,
          onCellBlur,
        },
      ]}
    />
  );

  const cell = document.getElementById("ReactUI:Table:num:Cell-0-0")!;

  // Select the cell, then double click it to start editing.
  act(() => {
    fireEvent.mouseDown(cell);
    jest.runAllTimers();
    fireEvent.mouseUp(document);
  });
  act(() => {
    fireEvent.doubleClick(cell.querySelector("p")!);
  });

  const input = document.getElementById(
    "ReactUI:Table:num:Editor"
  ) as HTMLInputElement;

  const typeText = (text: string) => {
    for (const ch of text) {
      fireEvent.change(input, { target: { value: input.value + ch } });
    }
  };

  return { ...utils, input, onCellBlur, typeText };
}

beforeAll(() => {
  // jsdom does not implement scrollIntoView.
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("NumberCellInput", () => {
  test.each([
    ["1.05", 1.05],
    ["-0.5", -0.5],
    ["10", 10],
    [".5", 0.5],
    ["3.", 3],
    ["１２", 12],
  ])("typing %s commits %d", (text, expected) => {
    const { input, onCellBlur, typeText } = setup(0);
    expect(input).not.toBeNull();

    fireEvent.change(input, { target: { value: "" } });
    typeText(text);
    fireEvent.blur(input);

    expect(onCellBlur).toHaveBeenCalledTimes(1);
    expect(onCellBlur.mock.calls[0][1]).toBe(expected);
  });

  test("clearing the input keeps it empty while typing", () => {
    const { input } = setup(5);

    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toBe("");
  });

  test("ignores characters that cannot form a number", () => {
    const { input, typeText } = setup(0);

    fireEvent.change(input, { target: { value: "" } });
    typeText("1a2");
    expect(input.value).toBe("12");
  });
});
