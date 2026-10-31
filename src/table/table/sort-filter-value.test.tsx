import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "./base";
import { TTableColumn } from "./type";
import { buildKeywordTextGetter } from "../filter-v2/keyword";

type Row = { owner: string; score: number };

// The app knows the names for the ids, so it can tell the table what to
// sort and filter by.
const names: Record<string, string> = { u1: "佐藤", u2: "あべ", u3: "伊藤" };

const ownerCol = (extra: Partial<TTableColumn<Row>> = {}): TTableColumn<Row> =>
  ({
    key: "owner",
    type: "string",
    label: "担当",
    render: (id: string) => <span>{names[id]}</span>,
    sortValue: (row: { owner: string }) => names[row.owner],
    filterValue: (row: { owner: string }) => names[row.owner],
    ...extra,
  }) as TTableColumn<Row>;

const rows = [
  { id: "1", owner: "u1", score: 1 },
  { id: "2", owner: "u2", score: 2 },
  { id: "3", owner: "u3", score: 3 },
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
const sortButton = (container: HTMLElement, label: string) =>
  Array.from(container.querySelectorAll("p.font-bold"))
    .find((p) => p.textContent === label)
    ?.closest("div.relative")
    ?.querySelector("div.cursor-pointer") ?? null;
const optionsList = () =>
  document.querySelector('[id="ReactUI:SelectBox:OptionsArea"]') as HTMLElement;

function addCondition(container: HTMLElement, target: string, operator: string, value: string) {
  fireEvent.click(container.querySelector('input[placeholder="絞り込む列を選択"]')!);
  fireEvent.click(within(optionsList()).getByText(target));
  act(() => { jest.runAllTimers(); });
  fireEvent.click(within(optionsList()).getByText(operator));
  act(() => { jest.runAllTimers(); });
  const input = container.querySelector('input[placeholder="値を入力して Enter"]') as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("sortValue / filterValue", () => {
  test("a render column with sortValue is sorted by it (the names, not the ids)", () => {
    const { container } = render(<Table cols={[ownerCol()]} rows={rows} />);

    fireEvent.click(sortButton(container, "担当")!);
    // あべ, 伊藤 (い), 佐藤 (さ): kana before kanji; ids would give u1, u2, u3
    expect(renderedIds(container)).toEqual(["2", "3", "1"]);
  });

  test("a render column with filterValue is filtered by it", () => {
    const { container } = render(<Table cols={[ownerCol()]} rows={rows} />);

    addCondition(container, "担当", "を含む", "藤");
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });

  test("the all-columns search looks at filterValue instead of the id", () => {
    const text = buildKeywordTextGetter([ownerCol()]);
    expect(text(rows[0])).toContain("佐藤");
    expect(text(rows[0])).not.toContain("u1");
  });

  test("disableSort / disableFilter: true still turn them off", () => {
    const { container } = render(
      <Table cols={[ownerCol({ disableSort: true, disableFilter: true })]} rows={rows} />
    );

    expect(sortButton(container, "担当")).toBeNull();
    fireEvent.click(container.querySelector('input[placeholder="絞り込む列を選択"]')!);
    expect(within(optionsList()).queryByText("担当")).toBeNull();
  });

  test("sortValue also works on a column without render", () => {
    const cols: TTableColumn<Row>[] = [
      { key: "score", type: "number", label: "点数", sortValue: (row) => -row.score },
    ];
    const { container } = render(<Table cols={cols} rows={rows} />);

    fireEvent.click(sortButton(container, "点数")!);
    expect(renderedIds(container)).toEqual(["3", "2", "1"]);
  });
});
