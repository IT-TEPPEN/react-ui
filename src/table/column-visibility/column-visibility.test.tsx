import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn, TTableCondition } from "../table/type";

type Row = { name: string; dept: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "氏名" },
  { key: "dept", type: "string", label: "部署" },
  { key: "age", type: "number", label: "年齢" },
];
const rows = [
  { id: "1", name: "佐藤", dept: "営業", age: 30 },
  { id: "2", name: "鈴木", dept: "開発", age: 40 },
];

afterEach(cleanup);

function renderTable(props: Partial<TPropsTable<Row>> = {}) {
  const reports: TTableCondition[] = [];
  const utils = render(
    <Table
      id="CV"
      cols={cols}
      rows={rows}
      columnSelector
      onConditionChange={(condition) => reports.push(condition)}
      {...props}
    />
  );
  return { ...utils, reports, last: () => reports[reports.length - 1] };
}

const firstRowTexts = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll("tbody tr[data-testid]")[0]?.querySelectorAll("td") ?? []
  ).map((td) => td.textContent);

const openMenu = () =>
  fireEvent.click(screen.getByRole("button", { name: /表示列/ }));

const columnCheckbox = (label: string) =>
  screen.getByRole("checkbox", { name: label }) as HTMLInputElement;

test("no column selector unless columnSelector is set", () => {
  renderTable({ columnSelector: undefined });
  expect(screen.queryByRole("button", { name: /表示列/ })).toBeNull();
});

test("hides and shows a column from the menu, and reports it", () => {
  const { container, last } = renderTable();
  expect(firstRowTexts(container)).toEqual(["佐藤", "営業", "30"]);
  expect(last().hiddenColumns).toEqual([]);

  openMenu();
  fireEvent.click(columnCheckbox("部署"));

  expect(firstRowTexts(container)).toEqual(["佐藤", "30"]);
  expect(screen.queryByText("部署", { selector: "p" })).toBeNull();
  expect(last().hiddenColumns).toEqual(["dept"]);
  // The button shows how many columns are shown.
  expect(screen.getByRole("button", { name: /表示列/ }).textContent).toContain(
    "2/3"
  );

  fireEvent.click(columnCheckbox("部署"));
  expect(firstRowTexts(container)).toEqual(["佐藤", "営業", "30"]);
  expect(last().hiddenColumns).toEqual([]);
});

test("starts with the columns in initialCondition.hiddenColumns hidden", () => {
  const { container, last } = renderTable({
    initialCondition: { hiddenColumns: ["age"] },
  });
  expect(firstRowTexts(container)).toEqual(["佐藤", "営業"]);
  expect(last().hiddenColumns).toEqual(["age"]);

  openMenu();
  expect(columnCheckbox("年齢").checked).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "すべて表示" }));
  expect(firstRowTexts(container)).toEqual(["佐藤", "営業", "30"]);
});

test("a column with disableHide cannot be hidden", () => {
  const { container } = renderTable({
    cols: [{ ...cols[0], disableHide: true }, cols[1], cols[2]],
    initialCondition: { hiddenColumns: ["name"] },
  });
  expect(firstRowTexts(container)).toEqual(["佐藤", "営業", "30"]);

  openMenu();
  expect(columnCheckbox("氏名").disabled).toBe(true);
});

test("the last shown column cannot be hidden", () => {
  renderTable({ initialCondition: { hiddenColumns: ["dept", "age"] } });
  openMenu();
  expect(columnCheckbox("氏名").disabled).toBe(true);
  expect(columnCheckbox("部署").disabled).toBe(false);
});

test("filters on a hidden column still apply", () => {
  const { container } = renderTable({
    initialCondition: {
      hiddenColumns: ["age"],
      filters: [{ key: "age", operator: "gt", value: 35 }],
    },
  });
  const ids = Array.from(container.querySelectorAll("tbody tr[data-testid]")).map(
    (tr) => tr.getAttribute("data-testid")
  );
  expect(ids).toEqual(["2"]);
});

test("Escape and a click outside close the menu", () => {
  renderTable();
  openMenu();
  expect(screen.getByRole("group", { name: "表示する列" })).toBeTruthy();

  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.queryByRole("group", { name: "表示する列" })).toBeNull();

  openMenu();
  fireEvent.mouseDown(document.body);
  expect(screen.queryByRole("group", { name: "表示する列" })).toBeNull();
});

test("English labels with locale en", () => {
  renderTable({ locale: "en" });
  fireEvent.click(screen.getByRole("button", { name: /Columns/ }));
  expect(screen.getByRole("group", { name: "Shown columns" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Show all" })).toBeTruthy();
});
