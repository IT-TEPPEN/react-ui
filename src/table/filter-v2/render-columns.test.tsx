import { act, cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";
import { buildKeywordTextGetter } from "./keyword";

type Row = { status: string; score: number; link: string };

// status is shown as a badge (a component), score as text with a unit, and
// link as a button whose label has nothing to do with the value.
const cols: TTableColumn<Row>[] = [
  { key: "status", type: "string", label: "状態", render: (v) => <span className="badge">{v}</span> },
  { key: "score", type: "number", label: "点数", render: (v) => `${v}点` },
  { key: "link", type: "string", label: "操作", render: () => <button>開く</button>, disableSort: true, disableFilter: true },
];
const rows = [
  { id: "1", status: "完了", score: 80, link: "https://example.com/1" },
  { id: "2", status: "対応中", score: 45, link: "https://example.com/2" },
  { id: "3", status: "未着手", score: 100, link: "https://example.com/3" },
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

function addCondition(container: HTMLElement, target: string, operator: string, value: string) {
  fireEvent.click(container.querySelector('input[placeholder="Select target"]')!);
  fireEvent.click(within(optionsList()).getByText(target));
  act(() => { jest.runAllTimers(); });
  fireEvent.click(within(optionsList()).getByText(operator));
  act(() => { jest.runAllTimers(); });
  const input = container.querySelector('input[placeholder="Search text"]') as HTMLInputElement;
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: "Enter" });
}

describe("columns with render", () => {
  test("can be filtered by their value", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "点数", "≧", "80");
    expect(renderedIds(container)).toEqual(["1", "3"]);
  });

  test("columns with disableFilter are not offered as targets", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    fireEvent.click(container.querySelector('input[placeholder="Select target"]')!);
    const targets = Array.from(optionsList().children).map((el) => el.textContent);
    expect(targets).toEqual(["すべての列", "状態", "点数"]);
  });

  test("the keyword search looks at the value and at text returned by render", () => {
    const text = buildKeywordTextGetter(cols);

    expect(text(rows[0])).toContain("完了"); // value of a component column
    expect(text(rows[0])).toContain("80点"); // text returned by render
    expect(text(rows[0])).not.toContain("example.com"); // disableFilter
  });

  test("the keyword search finds text that only render shows", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);

    addCondition(container, "すべての列", "like", "45点");
    expect(renderedIds(container)).toEqual(["2"]);
  });
});
