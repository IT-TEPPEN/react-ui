import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn } from "../table/type";

type Row = { name: string; dept: string; age: number; joined: Date };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "Name" },
  { key: "dept", type: "select", label: "Dept", options: [{ value: "s", label: "Sales" }, { value: "d", label: "Dev" }] },
  { key: "age", type: "number", label: "Age" },
  { key: "joined", type: "date", label: "Joined", render: (v) => v.toDateString() },
];
const rows = [
  { id: "1", name: "Taro", dept: "s", age: 30, joined: new Date(2020, 0, 1) },
  { id: "2", name: "Jiro", dept: "d", age: 20, joined: new Date(2023, 0, 1) },
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

const optionsList = () =>
  document.querySelector('[id="ReactUI:SelectBox:OptionsArea"]') as HTMLElement;
const shownOptions = () =>
  Array.from(optionsList()?.children ?? []).map((el) => el.textContent);

const renderTable = (props: Partial<TPropsTable<Row>> = {}) =>
  render(<Table cols={cols} rows={rows} {...props} />);

describe("wording in English", () => {
  test("search bar labels, conditions and the row range", () => {
    const { container, getByText, getByRole } = renderTable({
      locale: "en",
      initialCondition: {
        filters: [
          { key: "name", operator: "like", value: "ro" },
          { key: "dept", operator: "in", value: ["s", "d"] },
          { key: "age", operator: "gte", value: 20 },
          { key: "joined", operator: "lt", value: "2024-01-01" },
          { key: "name", operator: "is_not_null" },
        ],
      },
    });

    expect(getByText("Name contains ro")).toBeDefined();
    expect(getByText("Dept is any of Sales, Dev")).toBeDefined();
    expect(getByText("Age ≥ 20")).toBeDefined();
    expect(getByText("Joined before 1/1/2024")).toBeDefined();
    expect(getByText("Name is not empty")).toBeDefined();
    expect(getByRole("button", { name: "Match all" })).toBeDefined();
    expect(getByText("1–2 of 2")).toBeDefined();

    fireEvent.click(container.querySelector('input[placeholder="Filter by column"]')!);
    fireEvent.click(within(optionsList()).getByText("Age"));
    act(() => { jest.runAllTimers(); });
    expect(shownOptions()).toEqual(["is", "is not", ">", "<", "≥", "≤"]);
  });

  test("date conditions read as dates", () => {
    const { container } = renderTable({ locale: "en" });

    fireEvent.click(container.querySelector('input[placeholder="Filter by column"]')!);
    fireEvent.click(within(optionsList()).getByText("Joined"));
    act(() => { jest.runAllTimers(); });
    expect(shownOptions()).toEqual([
      "is", "is not", "after", "before", "on or after", "on or before", "is empty", "is not empty",
    ]);
  });
});

describe("wording in Japanese (default)", () => {
  test("conditions read as Japanese phrases", () => {
    const { getByText, getByRole } = renderTable({
      initialCondition: {
        filters: [
          { key: "dept", operator: "not_in", value: ["d"] },
          { key: "joined", operator: "gte", value: "2020-01-01" },
        ],
        filterMode: "or",
      },
    });

    expect(getByText("Dept：Dev のいずれでもない")).toBeDefined();
    expect(getByText("Joined：2020/1/1 以降")).toBeDefined();
    expect(getByRole("button", { name: "どれかに一致" })).toBeDefined();
    expect(getByText("2件中 1〜2件")).toBeDefined();
  });
});

describe("empty and loading states", () => {
  test("no rows: the no-data message, or a custom one", () => {
    const { getByText, rerender } = renderTable({ rows: [] });
    expect(getByText("データがありません")).toBeDefined();

    rerender(<Table cols={cols} rows={[]} locale="en" noDataMessage="No employees yet" />);
    expect(getByText("No employees yet")).toBeDefined();
  });

  test("rows exist but none match: a message about the filters", () => {
    const { getByText } = renderTable({
      locale: "en",
      initialCondition: { filters: [{ key: "name", operator: "eq", value: "nobody" }] },
    });
    expect(getByText("No rows match the filters")).toBeDefined();
  });

  test("loading with no rows yet shows the loading message instead of no data", () => {
    const { getByRole, queryByText } = renderTable({ rows: [], loading: true });

    expect(getByRole("status").textContent).toBe("読み込み中…");
    expect(queryByText("データがありません")).toBeNull();
  });

  test("loading with rows keeps them and shows a loading veil", () => {
    const { getByRole, getByTestId } = renderTable({ loading: true, locale: "en" });

    expect(getByTestId("1")).toBeDefined();
    expect(getByRole("status").textContent).toBe("Loading…");
  });
});
