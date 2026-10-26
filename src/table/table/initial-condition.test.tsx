import { cleanup, render } from "@testing-library/react";
import Table from "./base";
import { TPropsTable } from "./type";

afterEach(cleanup);

type Row = { name: string };

const rows = Array.from({ length: 60 }, (_, i) => ({
  id: String(i).padStart(2, "0"),
  name: `n${i}`,
}));

function renderedRowCount(initialCondition: TPropsTable<Row>["initialCondition"]) {
  const { container } = render(
    <Table
      cols={[{ key: "name", type: "string", label: "名前" }]}
      rows={rows}
      initialCondition={initialCondition}
    />
  );
  return container.querySelectorAll("tbody tr[data-testid]").length;
}

describe("initialCondition pagination", () => {
  test("shows 50 rows per page by default", () => {
    expect(renderedRowCount(undefined)).toBe(50);
  });

  test("pagination sets the rows per page", () => {
    expect(renderedRowCount({ pagination: { rowCountPerPage: 20 } })).toBe(20);
    cleanup();
    expect(renderedRowCount({ pagination: { rowCountPerPage: "all" } })).toBe(60);
  });

  test("the deprecated pagenation still works", () => {
    expect(renderedRowCount({ pagenation: { rowCountPerPage: 20 } })).toBe(20);
  });

  test("pagination wins when both are set", () => {
    expect(
      renderedRowCount({
        pagination: { rowCountPerPage: 100 },
        pagenation: { rowCountPerPage: 20 },
      })
    ).toBe(60);
  });
});
