import { cleanup, render } from "@testing-library/react";
import Table from "./base";
import { TTableColumn } from "./type";

afterEach(cleanup);

type Row = { name: string };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前" },
];

function renderedIds(container: HTMLElement) {
  return Array.from(container.querySelectorAll("tbody tr[data-testid]")).map(
    (tr) => tr.getAttribute("data-testid")
  );
}

describe("rows prop updates", () => {
  test("replacing rows with the same count but different ids renders the new rows", () => {
    const { container, rerender, getByText } = render(
      <Table cols={cols} rows={[{ id: "1", name: "a" }]} />
    );

    rerender(<Table cols={cols} rows={[{ id: "2", name: "b" }]} />);

    expect(renderedIds(container)).toEqual(["2"]);
    expect(getByText("b")).toBeDefined();
  });

  test("adding and removing rows updates the rendered rows", () => {
    const { container, rerender } = render(
      <Table cols={cols} rows={[{ id: "1", name: "a" }]} />
    );

    rerender(
      <Table
        cols={cols}
        rows={[
          { id: "1", name: "a" },
          { id: "2", name: "b" },
        ]}
      />
    );
    expect(renderedIds(container)).toEqual(["1", "2"]);

    rerender(<Table cols={cols} rows={[{ id: "2", name: "b" }]} />);
    expect(renderedIds(container)).toEqual(["2"]);
  });

  test("editing a row keeps the current order", () => {
    const sort = { key: "name", asc: true };
    const { container, rerender, getByText } = render(
      <Table
        cols={cols}
        initialCondition={{ sort }}
        rows={[
          { id: "1", name: "a" },
          { id: "2", name: "b" },
        ]}
      />
    );
    expect(renderedIds(container)).toEqual(["1", "2"]);

    // Row 1 would move to the end if the table re-sorted, but it should stay.
    rerender(
      <Table
        cols={cols}
        initialCondition={{ sort }}
        rows={[
          { id: "1", name: "z" },
          { id: "2", name: "b" },
        ]}
      />
    );
    expect(renderedIds(container)).toEqual(["1", "2"]);
    expect(getByText("z")).toBeDefined();
  });
});
