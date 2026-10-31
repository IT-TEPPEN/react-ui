import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";
import { buildKeywordTextGetter } from "./keyword";

type Row = { owner: string; score: number; link: string };

// owner: an id that a component turns into a name (e.g. loaded from a
// server), so its value is unrelated to what is shown. Not opted in.
// score: shown as "80点"; opted in to sorting and filtering.
// link: a button; not opted in.
const cols: TTableColumn<Row>[] = [
  { key: "owner", type: "string", label: "担当", render: (id) => <span>user-name-of-{id}</span> },
  { key: "score", type: "number", label: "点数", render: (v) => `${v}点`, disableSort: false, disableFilter: false },
  { key: "link", type: "string", label: "操作", render: () => <button>開く</button> },
];
const rows = [
  { id: "1", owner: "u12", score: 80, link: "https://example.com/1" },
  { id: "2", owner: "u7", score: 45, link: "https://example.com/2" },
  { id: "3", owner: "u3", score: 100, link: "https://example.com/12" },
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

describe("columns with render", () => {
  test("only columns that opt in are offered as filter targets", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    fireEvent.click(container.querySelector('input[placeholder="絞り込む列を選択"]')!);
    const targets = Array.from(optionsList().children).map((el) => el.textContent);
    expect(targets).toEqual(["すべての列", "点数"]);
  });

  test("a column that opts in is filtered by its value", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "点数", "以上", "80");
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });

  test("the keyword search does not look at the values of columns that did not opt in", () => {
    const text = buildKeywordTextGetter(cols);

    expect(text(rows[0])).not.toContain("u12"); // owner id
    expect(text(rows[2])).not.toContain("example.com"); // link
    expect(text(rows[0])).toContain("80点"); // opted in: text returned by render
  });

  test('searching "12" does not match an id or a link that is not shown', () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "すべての列", "を含む", "12");
    expect(renderedIds(container)).toEqual([]);
  });

  test("initialCondition.filters on a column that did not opt in is ignored with a warning", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Table
        cols={cols}
        rows={rows}
        initialCondition={{ filters: [{ key: "owner", operator: "eq", value: "u7" }] }}
      />
    );

    expect(warn).toHaveBeenCalledTimes(1);
    expect(renderedIds(container)).toEqual(["1", "2", "3"]);
  });
});
