import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "../../table/table/base";
import {
  addCondition,
  applyPanel,
  chooseColumn,
  conditionTexts,
  panel,
  setPanel,
} from "./test-helpers";
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

describe("filtering with the search bar", () => {
  test("a string condition filters the rows and can be removed", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "名前", { choice: "を含む", value: "ro" });

    expect(renderedIds(container)).toEqual(["1", "2"]);
    expect(conditionTexts(container)).toEqual(["名前 に「ro」を含む"]);

    // Remove the condition with its × button.
    fireEvent.click(within(container).getByRole("button", { name: "この条件を外す" }));
    expect(renderedIds(container)).toEqual(["1", "2", "3"]);
  });

  test("conditions are combined", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "年齢", { choice: "≥", value: "25" });
    expect(renderedIds(container)).toEqual(["1", "3"]);

    addCondition(container, "名前", { choice: "を含む", value: "a" });
    expect(renderedIds(container)).toEqual(["1", "3"]);

    addCondition(container, "名前", { choice: "を含まない", value: "k" });
    expect(renderedIds(container)).toEqual(["1"]);
    expect(conditionTexts(container)).toEqual([
      "年齢 ≥ 25",
      "名前 に「a」を含む",
      "名前 に「k」を含まない",
    ]);
  });

  test("a condition without a value needs no value", () => {
    const { container } = render(
      <Table cols={cols} rows={[...rows, { id: "4", name: "", age: 40 }]} />
    );

    chooseColumn(container, "名前");
    setPanel({ choice: "空欄" });
    expect(panel()!.querySelector("[data-panel-value]")).toBeNull();
    applyPanel();

    expect(conditionTexts(container)).toEqual(["名前 が空欄"]);
    expect(renderedIds(container)).toEqual(["4"]);
  });

  test("a number condition needs a number", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "年齢", { choice: "≥", value: "abc" });
    expect(conditionTexts(container)).toEqual([]);
    expect(within(panel()!).getByRole("alert").textContent).toBe("値を入れてください");

    // Empty input does not become 0 either.
    setPanel({ value: "" });
    applyPanel();
    expect(conditionTexts(container)).toEqual([]);

    // Full-width digits are accepted.
    setPanel({ value: "２５" });
    applyPanel();
    expect(conditionTexts(container)).toEqual(["年齢 ≥ 25"]);
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });

  test("the Enter that confirms IME conversion does not add the condition", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    chooseColumn(container, "名前");
    setPanel({ value: "たろう" });
    fireEvent.keyDown(panel()!.querySelector("[data-panel-value]")!, {
      key: "Enter",
      isComposing: true,
      keyCode: 229,
    });
    expect(conditionTexts(container)).toEqual([]);

    // The Enter after it adds the condition.
    fireEvent.keyDown(panel()!.querySelector("[data-panel-value]")!, { key: "Enter" });
    act(() => {
      jest.runAllTimers();
    });
    expect(conditionTexts(container)).toEqual(["名前 に「たろう」を含む"]);
  });

  test("a condition can be changed by clicking it", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);
    addCondition(container, "年齢", { choice: "≥", value: "25" });

    fireEvent.click(container.querySelector('[data-teppen-part="condition"]')!);
    expect((panel()!.querySelector("[data-panel-value]") as HTMLInputElement).value).toBe("25");
    setPanel({ choice: "<", value: "26" });
    applyPanel();

    expect(conditionTexts(container)).toEqual(["年齢 < 26"]);
    expect(renderedIds(container)).toEqual(["2", "3"]);
  });

  test("すべて解除 removes every condition", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);
    addCondition(container, "年齢", { choice: "≥", value: "25" });
    addCondition(container, "名前", { value: "a" });

    fireEvent.click(within(container).getByRole("button", { name: "すべて解除" }));

    expect(conditionTexts(container)).toEqual([]);
    expect(renderedIds(container)).toEqual(["1", "2", "3"]);
  });
});

describe("folding while the table is in use", () => {
  const filters = [
    { key: "name", operator: "like" as const, value: "a" },
    { key: "age", operator: "gte" as const, value: 20 },
    { key: "age", operator: "lte" as const, value: 40 },
  ];
  const bar = (container: HTMLElement) =>
    container.querySelector('[data-teppen-part="search-bar"]') as HTMLElement;
  const shown = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[data-teppen-part="condition"]')).filter(
      (el) => !(el as HTMLElement).hidden
    ).length;

  test("folds the conditions that do not fit into 'ほか N 件'", () => {
    const { container, getByRole } = render(
      <Table cols={cols} rows={rows} initialCondition={{ filters }} />
    );

    expect(bar(container).hasAttribute("data-folded")).toBe(true);
    // (No layout in tests: only the first condition fits.)
    expect(shown(container)).toBe(1);
    expect(getByRole("button", { name: "ほかの条件2件をすべて表示" }).textContent).toBe("ほか2件");
  });

  test("shows every condition while the search bar is used, and folds again after", () => {
    const { container, getByRole } = render(
      <Table cols={cols} rows={rows} initialCondition={{ filters }} />
    );

    fireEvent.click(getByRole("button", { name: "ほかの条件2件をすべて表示" }));
    expect(bar(container).hasAttribute("data-folded")).toBe(false);
    expect(shown(container)).toBe(3);

    // Back to the table.
    fireEvent.mouseDown(container.querySelector("tbody td")!);
    expect(bar(container).hasAttribute("data-folded")).toBe(true);

    // Focus in the search box shows them all again.
    act(() => {
      fireEvent.focusIn(container.querySelector('[data-teppen-part="search-bar"] input')!);
    });
    expect(shown(container)).toBe(3);
  });

  test("an open condition panel keeps every condition shown", () => {
    const { container } = render(
      <Table cols={cols} rows={rows} initialCondition={{ filters }} />
    );
    fireEvent.click(container.querySelector('[data-teppen-part="condition"]')!);
    expect(panel()).not.toBeNull();
    expect(shown(container)).toBe(3);
  });
});

test("on a narrow screen with no conditions, the box to type in is shown", () => {
  const width = jest
    .spyOn(HTMLElement.prototype, "clientWidth", "get")
    .mockReturnValue(400);
  const { container } = render(<Table cols={cols} rows={rows} />);
  const box = container.querySelector('[data-teppen-part="search-bar"] input')!;
  expect(box.closest(".hidden")).toBeNull();
  width.mockRestore();
});
