import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "../../table/table/base";
import { TTableColumn } from "../../table/table/type";

type Row = { name: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前" },
  { key: "age", type: "number", label: "年齢" },
];
const rows = [
  { id: "1", name: "Taro", age: 30 },
  { id: "2", name: "Jiro", age: 20 },
  { id: "3", name: "Hanako", age: 25 },
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

const renderedIds = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("tbody tr[data-testid]")).map((tr) =>
    tr.getAttribute("data-testid")
  );

// The options list of the select box that is currently open.
const optionsList = () =>
  document.querySelector('[id="ReactUI:SelectBox:OptionsArea"]') as HTMLElement;

function addCondition(
  container: HTMLElement,
  target: string,
  operator: string,
  value?: string
) {
  const targetInput = container.querySelector(
    'input[placeholder="Select target"]'
  ) as HTMLInputElement;
  fireEvent.click(targetInput);
  fireEvent.click(within(optionsList()).getByText(target));

  // The operator list opens by itself once the target is chosen.
  act(() => {
    jest.runAllTimers();
  });
  fireEvent.click(within(optionsList()).getByText(operator));
  act(() => {
    jest.runAllTimers();
  });

  if (value !== undefined) {
    const valueInput = container.querySelector(
      'input[placeholder="Search text"]'
    ) as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value } });
    fireEvent.keyDown(valueInput, { key: "Enter" });
  }
}

describe("filtering with the search bar", () => {
  test("a string condition filters the rows and can be removed", () => {
    const { container, getByText } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "名前", "like", "ro");

    expect(renderedIds(container)).toEqual(["1", "2"]);
    const chip = getByText("名前 like ro");

    // Remove the condition with the icon next to its label.
    fireEvent.click(chip.parentElement!.querySelector("svg")!);
    expect(renderedIds(container)).toEqual(["1", "2", "3"]);
  });

  test("conditions are combined", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "年齢", "≧", "25");
    expect(renderedIds(container)).toEqual(["1", "3"]);

    addCondition(container, "名前", "like", "a");
    expect(renderedIds(container)).toEqual(["1", "3"]);

    addCondition(container, "名前", "not like", "k");
    expect(renderedIds(container)).toEqual(["1"]);
  });

  test("a condition without a value is added right after choosing the operator", () => {
    const { container, getByText } = render(
      <Table cols={cols} rows={[...rows, { id: "4", name: "", age: 40 }]} />
    );

    addCondition(container, "名前", "is empty");

    expect(getByText("名前 is empty")).toBeDefined();
    expect(renderedIds(container)).toEqual(["4"]);
  });

  test("a number condition needs a number", () => {
    const { container, queryByText, getByText } = render(
      <Table cols={cols} rows={rows} />
    );

    addCondition(container, "年齢", "≧", "abc");
    expect(queryByText(/年齢 ≧/)).toBeNull();
    const valueInput = container.querySelector(
      'input[placeholder="Search text"]'
    ) as HTMLInputElement;
    expect(valueInput.getAttribute("aria-invalid")).toBe("true");

    // Empty input does not become 0 either.
    fireEvent.change(valueInput, { target: { value: "" } });
    fireEvent.keyDown(valueInput, { key: "Enter" });
    expect(queryByText(/年齢 ≧/)).toBeNull();

    // Full-width digits are accepted.
    fireEvent.change(valueInput, { target: { value: "２５" } });
    fireEvent.keyDown(valueInput, { key: "Enter" });
    expect(getByText("年齢 ≧ 25")).toBeDefined();
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });

  test("the Enter that confirms IME conversion does not add the condition", () => {
    const { container, queryByText } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "名前", "like");
    const valueInput = container.querySelector(
      'input[placeholder="Search text"]'
    ) as HTMLInputElement;
    fireEvent.change(valueInput, { target: { value: "たろう" } });
    fireEvent.keyDown(valueInput, { key: "Enter", isComposing: true, keyCode: 229 });

    expect(queryByText(/名前 like/)).toBeNull();
  });
});
