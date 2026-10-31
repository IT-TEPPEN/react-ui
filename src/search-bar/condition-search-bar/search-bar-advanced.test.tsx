import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { useState } from "react";
import Table from "../../table/table/base";
import { TTableColumn } from "../../table/table/type";

type Row = { name: string; role: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前" },
  {
    key: "role",
    type: "select",
    label: "役割",
    options: [
      { value: "1", label: "管理者" },
      { value: "2", label: "ユーザー" },
      { value: "3", label: "ゲスト" },
    ],
  },
  { key: "age", type: "number", label: "年齢" },
];
const rows = [
  { id: "1", name: "Taro", role: "1", age: 30 },
  { id: "2", name: "Jiro", role: "2", age: 20 },
  { id: "3", name: "Hanako", role: "3", age: 25 },
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

const optionsList = () =>
  document.querySelector('[id="ReactUI:SelectBox:OptionsArea"]') as HTMLElement;
const shownOptions = () =>
  Array.from(optionsList()?.children ?? []).map((el) => el.textContent);

function chooseTarget(container: HTMLElement, target: string) {
  fireEvent.click(
    container.querySelector('input[placeholder="絞り込む列を選択"]')!
  );
  fireEvent.click(within(optionsList()).getByText(target));
  act(() => {
    jest.runAllTimers();
  });
}

function chooseOperator(operator: string) {
  fireEvent.click(within(optionsList()).getByText(operator));
  act(() => {
    jest.runAllTimers();
  });
}

function typeValue(container: HTMLElement, value: string) {
  const input = container.querySelector(
    'input[placeholder="値を入力して Enter"]'
  ) as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("keyword search over all columns", () => {
  test('"すべての列" is the first target and offers contains / does not contain', () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    fireEvent.click(
      container.querySelector('input[placeholder="絞り込む列を選択"]')!
    );
    expect(shownOptions()[0]).toBe("すべての列");

    fireEvent.click(within(optionsList()).getByText("すべての列"));
    act(() => {
      jest.runAllTimers();
    });
    expect(shownOptions()).toEqual(["を含む", "を含まない"]);
  });

  test("finds rows by any column, using option labels", () => {
    const { container, getByText } = render(<Table cols={cols} rows={rows} />);

    chooseTarget(container, "すべての列");
    chooseOperator("を含む");
    typeValue(container, "げすと");

    expect(getByText("すべての列：げすと を含む")).toBeDefined();
    expect(renderedIds(container)).toEqual(["3"]);
  });

  test('is called "All columns" with locale="en"', () => {
    const { container } = render(<Table cols={cols} rows={rows} locale="en" />);

    fireEvent.click(
      container.querySelector('input[placeholder="Filter by column"]')!
    );
    expect(shownOptions()[0]).toBe("All columns");
  });
});

describe("in / not in", () => {
  test("filters by several values of a select column", () => {
    const { container, getByText, getByRole } = render(
      <Table cols={cols} rows={rows} />
    );

    chooseTarget(container, "役割");
    chooseOperator("のいずれか");

    const ok = getByRole("button", { name: "追加" }) as HTMLButtonElement;
    expect(ok.disabled).toBe(true);

    fireEvent.click(getByRole("button", { name: "ゲスト" }));
    fireEvent.click(getByRole("button", { name: "管理者" }));
    fireEvent.click(getByRole("button", { name: "ユーザー" }));
    fireEvent.click(getByRole("button", { name: "ユーザー" })); // unselect
    fireEvent.click(ok);

    // Labels in the order of the options.
    expect(getByText("役割：管理者、ゲスト のいずれか")).toBeDefined();
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });

  test("not in leaves out the chosen values", () => {
    const { container, getByRole } = render(<Table cols={cols} rows={rows} />);

    chooseTarget(container, "役割");
    chooseOperator("のいずれでもない");
    fireEvent.click(getByRole("button", { name: "管理者" }));
    fireEvent.click(getByRole("button", { name: "追加" }));

    expect(renderedIds(container)).toEqual(["2", "3"]);
  });
});

describe("AND / OR", () => {
  test("the toggle appears with two conditions and switches the result", () => {
    const { container, queryByRole, getByRole } = render(
      <Table cols={cols} rows={rows} />
    );

    chooseTarget(container, "名前");
    chooseOperator("を含む");
    typeValue(container, "taro");
    expect(queryByRole("button", { name: "すべてに一致" })).toBeNull();

    chooseTarget(container, "年齢");
    chooseOperator("より小さい");
    typeValue(container, "25");
    expect(renderedIds(container)).toEqual([]);

    const toggle = getByRole("button", { name: "すべてに一致" });
    fireEvent.click(toggle);

    expect(toggle.textContent).toBe("どれかに一致");
    expect(renderedIds(container)).toEqual(["1", "2"]);
  });
});

test("a condition being entered survives a re-render with new cols", () => {
  let rerenderParent = () => {};
  function Parent() {
    const [, setCount] = useState(0);
    rerenderParent = () => setCount((c) => c + 1);
    // cols created on every render, as is common in apps
    return <Table cols={cols.map((c) => ({ ...c }))} rows={rows} />;
  }
  const { container } = render(<Parent />);

  chooseTarget(container, "名前");
  act(() => rerenderParent());

  // Still waiting for the operator of 名前.
  expect(shownOptions()).toContain("を含む");
  expect(container.textContent).toContain("名前");
  chooseOperator("を含む");
  typeValue(container, "jiro");
  expect(renderedIds(container)).toEqual(["2"]);
});

test("options that arrive later do not reset a condition being entered", () => {
  let loadOptions = () => {};
  function Parent() {
    const [options, setOptions] = useState([{ value: "1", label: "管理者" }]);
    loadOptions = () =>
      setOptions([
        { value: "1", label: "管理者" },
        { value: "3", label: "ゲスト" },
      ]);
    return (
      <Table
        cols={[{ key: "role", type: "select", label: "役割", options }]}
        rows={rows}
      />
    );
  }
  const { container, getByRole } = render(<Parent />);

  chooseTarget(container, "役割");
  chooseOperator("のいずれか");
  act(() => loadOptions());

  // Still choosing values, now with the new option.
  fireEvent.click(getByRole("button", { name: "ゲスト" }));
  fireEvent.click(getByRole("button", { name: "追加" }));
  expect(renderedIds(container)).toEqual(["3"]);
});
