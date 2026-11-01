import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import { useState } from "react";
import Table from "./base";
import { TPropsTable, TTableColumn, TTableCondition } from "./type";

type Row = { name: string; role: string; age: number; joined: Date };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前", editable: true, onCellBlur: () => {} },
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
  { key: "joined", type: "date", label: "入社日", render: (v) => v.toISOString() },
];
const rows = [
  { id: "1", name: "Taro", role: "1", age: 30, joined: new Date(2020, 3, 1) },
  { id: "2", name: "Jiro", role: "2", age: 20, joined: new Date(2023, 3, 1) },
  { id: "3", name: "Hanako", role: "3", age: 25, joined: new Date(2021, 9, 1) },
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
  jest.restoreAllMocks();
});

const renderedIds = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("tbody tr[data-testid]")).map((tr) =>
    tr.getAttribute("data-testid")
  );

const renderTable = (props: Partial<TPropsTable<Row>> = {}) =>
  render(<Table cols={cols} rows={rows} {...props} />);

describe("initialCondition.filters", () => {
  test("applies the filters on the first render and shows them", () => {
    const { container, getByText } = renderTable({
      initialCondition: {
        filters: [
          { key: "role", operator: "in", value: ["1", "3"] },
          { key: "age", operator: "gte", value: "25" },
          { key: "joined", operator: "lt", value: "2021-01-01" },
        ],
      },
    });

    expect(renderedIds(container)).toEqual(["1"]);
    expect(getByText("役割：管理者、ゲスト のいずれか")).toBeDefined();
    expect(getByText("年齢：25 以上")).toBeDefined();
  });

  test("supports the keyword filter and OR", () => {
    const { container, getByText } = renderTable({
      initialCondition: {
        filters: [
          { key: "*", operator: "like", value: "げすと" },
          { key: "name", operator: "eq", value: "Taro" },
        ],
        filterMode: "or",
      },
    });

    expect(renderedIds(container)).toEqual(["1", "3"]);
    expect(getByText("すべての列：げすと を含む")).toBeDefined();
    expect(getByText("どれかに一致")).toBeDefined();
  });

  test("ignores filters that do not fit, with a warning", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = renderTable({
      initialCondition: {
        filters: [
          { key: "nope", operator: "eq", value: "x" },
          { key: "age", operator: "like", value: "2" },
          { key: "age", operator: "eq", value: "abc" },
          { key: "*", operator: "eq", value: "Taro" },
          { key: "name", operator: "like", value: "a" },
        ],
      },
    });

    expect(warn).toHaveBeenCalledTimes(4);
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });
});

describe("onConditionChange", () => {
  test("reports the condition and rows on the first render", () => {
    const onConditionChange = jest.fn();
    renderTable({
      onConditionChange,
      initialCondition: {
        sort: { key: "age", asc: false },
        filters: [{ key: "age", operator: "lt", value: 30 }],
      },
    });

    expect(onConditionChange).toHaveBeenCalledTimes(1);
    const [condition, shown] = onConditionChange.mock.calls[0];
    expect(condition).toEqual({
      filters: [{ key: "age", operator: "lt", value: 30 }],
      filterMode: "and",
      sort: { key: "age", asc: false },
      pagination: { rowCountPerPage: 50, page: 1 },
      columnWidths: {},
      hiddenColumns: [],
    });
    expect(shown).toEqual([rows[2], rows[1]]);
    expect(shown[0]).toBe(rows[2]);
  });

  test("reports changes made in the search bar and by sorting", () => {
    const onConditionChange = jest.fn();
    const { container } = renderTable({ onConditionChange });
    const last = () => onConditionChange.mock.calls.at(-1)!;

    // Add 名前 を含む "ro" with the search bar.
    fireEvent.click(container.querySelector('input[placeholder="絞り込む列を選択"]')!);
    const options = () => document.querySelector('[id="ReactUI:SelectBox:OptionsArea"]') as HTMLElement;
    fireEvent.click(within(options()).getByText("名前"));
    act(() => { jest.runAllTimers(); });
    fireEvent.click(within(options()).getByText("を含む"));
    act(() => { jest.runAllTimers(); });
    const input = container.querySelector('input[placeholder="値を入力して Enter"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ro" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(last()[0].filters).toEqual([{ key: "name", operator: "like", value: "ro" }]);
    expect(last()[1].map((r: { id: string }) => r.id)).toEqual(["1", "2"]);

    // Sort by 年齢.
    const label = Array.from(container.querySelectorAll("p.font-bold")).find((p) => p.textContent === "年齢")!;
    fireEvent.click(label.closest("div.relative")!.querySelector("div.cursor-pointer")!);

    expect(last()[0].sort).toEqual({ key: "age", asc: true });
    expect(last()[1].map((r: { id: string }) => r.id)).toEqual(["2", "1"]);
  });

  test("the reported condition restores the same view", () => {
    let saved: TTableCondition | undefined;
    const first = renderTable({
      initialCondition: {
        sort: { key: "name", asc: true },
        filters: [
          { key: "role", operator: "not_in", value: ["2"] },
          { key: "joined", operator: "gte", value: new Date(2020, 0, 1) },
        ],
      },
      onConditionChange: (condition) => {
        saved = condition;
      },
    });
    const before = renderedIds(first.container);
    first.unmount();

    // Saved as JSON (e.g. in localStorage): the Date becomes a string.
    const restored = JSON.parse(JSON.stringify(saved));
    expect(typeof restored.filters[1].value).toBe("string");

    const second = renderTable({ initialCondition: restored });
    expect(renderedIds(second.container)).toEqual(before);
    expect(before).toEqual(["3", "1"]);
  });

  test("gives the current row objects after an edit", () => {
    const onConditionChange = jest.fn();
    const { rerender } = renderTable({ onConditionChange });

    const edited = rows.map((r) => (r.id === "2" ? { ...r, name: "Jiro2" } : r));
    rerender(<Table cols={cols} rows={edited} onConditionChange={onConditionChange} />);

    const shown = onConditionChange.mock.calls.at(-1)![1];
    expect(shown.find((r: { id: string }) => r.id === "2")).toBe(edited[1]);
  });

  test("setting state in the callback does not loop", () => {
    let renders = 0;
    function App() {
      const [count, setCount] = useState(0);
      renders++;
      return (
        <>
          <p data-testid="count">{count}</p>
          <Table
            cols={cols.map((c) => ({ ...c }))}
            rows={rows}
            onConditionChange={(_, shown) => setCount(shown.length)}
          />
        </>
      );
    }
    const { getByTestId } = render(<App />);

    expect(getByTestId("count").textContent).toBe("3");
    expect(renders).toBeLessThan(5);
  });
});
