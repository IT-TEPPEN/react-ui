import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn } from "../table/type";

type Row = { name: string; dept: string };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前" },
  { key: "dept", type: "string", label: "部署" },
];
const rows = [
  { id: "1", name: "a", dept: "営業" },
  { id: "2", name: "b", dept: "開発" },
  { id: "3", name: "c", dept: "営業" },
  { id: "4", name: "d", dept: "営業" },
];
// dept = 営業: rows 1, 3, 4. With 2 rows per page, page 1 shows 1 and 3.
const filteredOnPage = {
  filters: [{ key: "dept", operator: "eq" as const, value: "営業" }],
  pagination: { rowCountPerPage: 2 },
};

afterEach(cleanup);

function renderTable(
  selectAll: "all" | "filtered" | "page" | undefined,
  checkedIds: string[] = [],
  props: Partial<TPropsTable<Row>> = {}
) {
  const onChecked = jest.fn();
  const onUnchecked = jest.fn();
  const utils = render(
    <Table
      id="SA"
      cols={cols}
      rows={rows}
      initialCondition={filteredOnPage}
      checkbox={{
        checked: (row) => checkedIds.includes(String(row.id)),
        onChecked,
        onUnchecked,
        selectAll,
      }}
      {...props}
    />
  );
  const header = utils.container.querySelector(
    '[data-teppen-part="header"] input[type="checkbox"]'
  ) as HTMLInputElement;
  const ids = (fn: jest.Mock) => fn.mock.calls.map(([row]) => row.id);
  return { ...utils, header, onChecked, onUnchecked, ids };
}

describe("checkbox.selectAll", () => {
  test('"all" (default) checks every row, also those hidden by filters', () => {
    const { header, onChecked, ids } = renderTable(undefined);
    fireEvent.click(header);
    expect(ids(onChecked)).toEqual(["1", "2", "3", "4"]);
  });

  test('"filtered" checks the rows that pass the filters, on every page', () => {
    const { header, onChecked, ids } = renderTable("filtered");
    fireEvent.click(header);
    expect(ids(onChecked)).toEqual(["1", "3", "4"]);
  });

  test('"page" checks the rows on the current page', () => {
    const { header, onChecked, ids } = renderTable("page");
    fireEvent.click(header);
    expect(ids(onChecked)).toEqual(["1", "3"]);
  });

  test("the header is checked, not partly, when all of its rows are", () => {
    // Row 2 is not checked, but it does not pass the filters.
    const { header } = renderTable("filtered", ["1", "3", "4"]);
    expect(header.checked).toBe(true);
    expect(header.indeterminate).toBe(false);

    cleanup();
    const all = renderTable("all", ["1", "3", "4"]);
    expect(all.header.checked).toBe(true);
    expect(all.header.indeterminate).toBe(true);
  });

  test("unchecking leaves checked rows outside of it as they are", () => {
    const { header, onUnchecked, ids } = renderTable("page", ["1", "2", "4"]);
    expect(header.indeterminate).toBe(true);
    fireEvent.click(header);
    expect(ids(onUnchecked)).toEqual(["1"]);
  });

  test("the header is not checked when none of its rows are", () => {
    // Row 2 is checked, but it does not pass the filters.
    const { header } = renderTable("filtered", ["2"]);
    expect(header.checked).toBe(false);
  });

  test("passes the current row objects", () => {
    const { header, onChecked, rerender } = renderTable("filtered");
    const edited = rows.map((row) => ({ ...row, name: row.name + "!" }));
    rerender(
      <Table
        id="SA"
        cols={cols}
        rows={edited}
        initialCondition={filteredOnPage}
        checkbox={{
          checked: () => false,
          onChecked,
          onUnchecked: jest.fn(),
          selectAll: "filtered",
        }}
      />
    );
    fireEvent.click(header);
    expect(onChecked.mock.calls[0][0]).toBe(edited[0]);
  });
});
