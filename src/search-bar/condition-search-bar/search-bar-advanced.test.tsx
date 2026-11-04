import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { useState } from "react";
import Table from "../../table/table/base";
import {
  addCondition,
  applyPanel,
  chooseColumn,
  conditionTexts,
  panel,
  searchBox,
  setPanel,
  shownOptions,
} from "./test-helpers";
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

describe("keyword search over all columns", () => {
  test('"すべての列" is the first target and offers contains / does not contain', () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    fireEvent.click(searchBox(container));
    expect(shownOptions()[0]).toBe("すべての列");

    chooseColumn(container, "すべての列");
    const choices = within(panel()!)
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-pressed"))
      .map((b) => b.textContent);
    expect(choices).toEqual(["を含む", "を含まない"]);
  });

  test("finds rows by any column, using option labels", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "すべての列", { value: "げすと" });

    expect(conditionTexts(container)).toEqual(["すべての列 に「げすと」を含む"]);
    expect(renderedIds(container)).toEqual(["3"]);
  });

  test('is called "All columns" with locale="en"', () => {
    const { container } = render(<Table cols={cols} rows={rows} locale="en" />);

    fireEvent.click(searchBox(container));
    expect(shownOptions()[0]).toBe("All columns");
  });
});

describe("in / not in", () => {
  test("filters by several values of a select column", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    chooseColumn(container, "役割");
    // Nothing checked yet: not added.
    applyPanel();
    expect(conditionTexts(container)).toEqual([]);
    expect(within(panel()!).getByRole("alert").textContent).toBe("1つ以上選んでください");

    setPanel({ checks: ["ゲスト", "管理者", "ユーザー", "ユーザー"] }); // the last unchecks
    applyPanel();

    // Labels in the order of the options.
    expect(conditionTexts(container)).toEqual(["役割 が 管理者・ゲスト のどれか"]);
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });

  test("not in leaves out the chosen values", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "役割", { choice: "以外", checks: ["管理者"] });

    expect(conditionTexts(container)).toEqual(["役割 が 管理者 以外"]);
    expect(renderedIds(container)).toEqual(["2", "3"]);
  });
});

describe("AND / OR", () => {
  test("the switch appears with two conditions and changes the result", () => {
    const { container, queryByRole, getByRole } = render(
      <Table cols={cols} rows={rows} />
    );

    addCondition(container, "名前", { value: "taro" });
    expect(queryByRole("button", { name: /すべて満たす/ })).toBeNull();

    addCondition(container, "年齢", { choice: "<", value: "25" });
    expect(renderedIds(container)).toEqual([]);

    fireEvent.click(getByRole("button", { name: /すべて満たす/ }));

    expect(getByRole("button", { name: /どれか満たす/ })).toBeDefined();
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

  chooseColumn(container, "名前");
  setPanel({ value: "jiro" });
  act(() => rerenderParent());

  // The panel for 名前 is still open, with the value typed.
  expect((panel()!.querySelector("[data-panel-value]") as HTMLInputElement).value).toBe("jiro");
  applyPanel();
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
  const { container } = render(<Parent />);

  chooseColumn(container, "役割");
  act(() => loadOptions());

  // Still choosing values, now with the new option.
  setPanel({ checks: ["ゲスト"] });
  applyPanel();
  expect(renderedIds(container)).toEqual(["3"]);
});
