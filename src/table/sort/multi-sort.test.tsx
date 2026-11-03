import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn, TTableCondition } from "../table/type";
import { sortReducer } from "./hooks";

type State = Parameters<typeof sortReducer>[0];
const start = (sorts: State["sorts"]): State => ({ sorts, isUpdatedData: false, sortTiming: 0 });
const run = (state: State, ...actions: [("click" | "shiftClick"), string][]) =>
  actions.reduce((s, [type, key]) => sortReducer(s, { type, payload: { key } }), state).sorts;

describe("sort conditions", () => {
  test("A, Shift+B, then Shift+A turns A descending in its place, then removes it", () => {
    let state = start([]);
    state = sortReducer(state, { type: "click", payload: { key: "A" } });
    expect(state.sorts).toEqual([{ key: "A", asc: true }]);

    state = sortReducer(state, { type: "shiftClick", payload: { key: "B" } });
    expect(state.sorts).toEqual([{ key: "A", asc: true }, { key: "B", asc: true }]);

    state = sortReducer(state, { type: "shiftClick", payload: { key: "A" } });
    expect(state.sorts).toEqual([{ key: "A", asc: false }, { key: "B", asc: true }]);

    state = sortReducer(state, { type: "shiftClick", payload: { key: "A" } });
    expect(state.sorts).toEqual([{ key: "B", asc: true }]);

    state = sortReducer(state, { type: "shiftClick", payload: { key: "A" } });
    expect(state.sorts).toEqual([{ key: "B", asc: true }, { key: "A", asc: true }]);
  });

  test("a click sorts by that column only, ascending, when sorting by several", () => {
    const sorts = run(start([{ key: "A", asc: false }, { key: "B", asc: true }]), ["click", "A"]);
    expect(sorts).toEqual([{ key: "A", asc: true }]);
  });

  test("a click on the only column toggles its order, as before", () => {
    expect(run(start([{ key: "A", asc: true }]), ["click", "A"])).toEqual([{ key: "A", asc: false }]);
    expect(run(start([{ key: "A", asc: true }]), ["click", "B"])).toEqual([{ key: "B", asc: true }]);
  });

  test("removing the last condition leaves none (rows in id order)", () => {
    expect(run(start([{ key: "A", asc: false }]), ["shiftClick", "A"])).toEqual([]);
  });
});

// ---- in the table --------------------------------------------------------

type Row = { name: string; dept: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前" },
  {
    key: "dept",
    type: "select",
    label: "部署",
    // Sorted by label: 営業 (え) comes before 開発 (か), although its
    // value "z" comes after "a".
    options: [
      { value: "z", label: "営業" },
      { value: "a", label: "開発" },
    ],
  },
  { key: "age", type: "number", label: "年齢" },
] as TTableColumn<Row>[];

const rows = [
  { id: "1", name: "a", dept: "a", age: 30 },
  { id: "2", name: "b", dept: "z", age: 40 },
  { id: "3", name: "c", dept: "a", age: 20 },
  { id: "4", name: "d", dept: "z", age: null as unknown as number }, // empty
  { id: "5", name: "e", dept: "z", age: 25 },
];

afterEach(cleanup);

function sortButton(container: HTMLElement, label: string) {
  const p = Array.from(container.querySelectorAll('[data-teppen-part="header"] p')).find(
    (el) => el.textContent === label
  )!;
  return p.closest("div.relative")!.querySelector('[data-teppen-part="sort-button"]')!;
}

const names = (container: HTMLElement) =>
  Array.from(container.querySelectorAll("tbody tr[data-testid]")).map(
    (tr) => tr.querySelectorAll("td")[0].textContent
  );

const priorities = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-teppen-part="sort-priority"]')).map((el) => el.textContent);

test("Shift+click sorts by a second column within the first", () => {
  const reports: TTableCondition[] = [];
  const { container } = render(
    <Table id="MS" cols={cols} rows={rows} onConditionChange={(c) => reports.push(c)} />
  );

  fireEvent.click(sortButton(container, "部署"));
  fireEvent.click(sortButton(container, "年齢"), { shiftKey: true });

  // 営業 (b 40, d empty, e 25), then 開発 (a 30, c 20); by age within each,
  // with the empty age last.
  expect(names(container)).toEqual(["e", "b", "d", "c", "a"]);
  expect(priorities(container)).toEqual(["1", "2"]);

  const last = reports[reports.length - 1];
  expect(last.sorts).toEqual([
    { key: "dept", asc: true },
    { key: "age", asc: true },
  ]);
  expect(last.sort).toEqual({ key: "dept", asc: true });

  // Shift+click on 部署 again: descending, still first.
  fireEvent.click(sortButton(container, "部署"), { shiftKey: true });
  expect(names(container)).toEqual(["c", "a", "e", "b", "d"]);

  // A plain click: 年齢 only; the priority numbers go away.
  fireEvent.click(sortButton(container, "年齢"));
  expect(names(container)).toEqual(["c", "e", "a", "b", "d"]);
  expect(priorities(container)).toEqual([]);
});

test("initialCondition.sorts restores several conditions", () => {
  const { container } = render(
    <Table
      id="MS"
      cols={cols}
      rows={rows}
      initialCondition={{
        sorts: [{ key: "dept" }, { key: "age", asc: false }],
        sort: { key: "name" }, // sorts wins
      }}
    />
  );
  expect(names(container)).toEqual(["b", "e", "d", "a", "c"]);
  expect(priorities(container)).toEqual(["1", "2"]);
});

test("initialCondition.sort alone works as before", () => {
  const { container } = render(
    <Table id="MS" cols={cols} rows={rows} initialCondition={{ sort: { key: "age", asc: false } }} />
  );
  expect(names(container)).toEqual(["b", "a", "e", "c", "d"]);
  expect(priorities(container)).toEqual([]);
});
