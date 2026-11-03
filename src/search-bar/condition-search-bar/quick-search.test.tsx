import { act, cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../../table/table/base";
import { TTableColumn, TTableCondition } from "../../table/table/type";

type Row = { name: string; dept: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "氏名" },
  {
    key: "dept",
    type: "select",
    label: "部署",
    options: [
      { value: "s", label: "営業部" },
      { value: "d", label: "開発部" },
    ],
  },
  { key: "age", type: "number", label: "年齢" },
];
const rows = [
  { id: "1", name: "佐藤", dept: "s", age: 30 },
  { id: "2", name: "鈴木", dept: "d", age: 41 },
  { id: "3", name: "佐々木", dept: "s", age: 25 },
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

function setup() {
  const reports: TTableCondition[] = [];
  const utils = render(
    <Table id="Q" cols={cols} rows={rows} onConditionChange={(c) => reports.push(c)} />
  );
  const bar = () => utils.container.querySelector('[data-teppen-part="search-bar"]')!;
  const input = () => bar().querySelectorAll("input")[bar().querySelectorAll("input").length - 1] as HTMLInputElement;
  const ids = () =>
    Array.from(utils.container.querySelectorAll("tbody tr[data-testid]")).map((tr) =>
      tr.getAttribute("data-testid")
    );
  const options = () =>
    Array.from(
      document.querySelectorAll('[id="ReactUI:SelectBox:OptionsArea"] > div')
    ).map((el) => el.textContent);
  const type = (text: string) => {
    fireEvent.click(input());
    fireEvent.change(input(), { target: { value: text } });
  };
  const key = (k: string) =>
    act(() => {
      fireEvent.keyDown(document, { key: k });
      jest.runAllTimers();
    });
  return { ...utils, bar, input, ids, options, type, key, last: () => reports[reports.length - 1] };
}

test("typing a word and Enter searches every column for it", () => {
  const { type, key, ids, options, last, bar } = setup();
  type("営業");
  expect(options()[0]).toBe("「営業」をすべての列から探す");

  key("Enter");

  expect(ids()).toEqual(["1", "3"]);
  expect(last().filters).toEqual([{ key: "*", operator: "like", value: "営業" }]);
  expect(bar().textContent).toContain("営業");
});

test("a word that is a column name chooses that column first", () => {
  const { type, key, options, bar } = setup();
  type("部署");
  expect(options().slice(0, 2)).toEqual(["部署", "「部署」をすべての列から探す"]);

  key("Enter");
  // Now choosing the condition for 部署.
  expect(bar().textContent).toContain("部署");
  expect(options()[0]).toBe("と等しい");
});

test("each list starts with its first option chosen, so Enter alone goes on", () => {
  const { type, key, ids, input } = setup();
  type("氏名");
  key("Enter"); // the column
  key("Enter"); // its first condition: を含む
  act(() => {
    jest.runAllTimers();
  });
  fireEvent.change(input(), { target: { value: "佐" } });
  act(() => {
    fireEvent.keyDown(input(), { key: "Enter" });
  });

  // "を含む": both 佐藤 and 佐々木 match part of their name.
  expect(ids()).toEqual(["1", "3"]);
});

test("the Enter that confirms Japanese input does not choose an option", () => {
  const { type, ids, options } = setup();
  type("えいぎょう");
  act(() => {
    fireEvent.keyDown(document, { key: "Enter", keyCode: 229 });
  });
  expect(options().length).toBeGreaterThan(0); // still open
  expect(ids()).toEqual(["1", "2", "3"]);
});

test("text columns list を含む first", () => {
  const { type, key, options } = setup();
  type("氏名");
  key("Enter");
  expect(options().slice(0, 4)).toEqual(["を含む", "を含まない", "と等しい", "と等しくない"]);
});

test("without typing, the list shows the columns as before", () => {
  const { options, input } = setup();
  fireEvent.click(input());
  expect(options()).toEqual(["すべての列", "氏名", "部署", "年齢"]);
});
