import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "./base";
import { TTableColumn } from "./type";

afterEach(cleanup);

type Row = { name: string };
const cols: TTableColumn<Row>[] = [{ key: "name", type: "string", label: "名前" }];

describe("empty table", () => {
  test("NO DATA spans every column including the checkbox column", () => {
    const { container } = render(
      <Table
        cols={cols}
        rows={[]}
        checkbox={{ checked: () => false, onChecked: () => {}, onUnchecked: () => {} }}
      />
    );

    const headerCount = container.querySelectorAll("thead th").length;
    expect(headerCount).toBe(2);
    expect(container.querySelector("td[colspan]")!.getAttribute("colspan")).toBe(
      String(headerCount)
    );
  });

  test("pagination shows 0 rows and cannot move to another page", () => {
    const { container, getByText } = render(<Table cols={cols} rows={[]} />);

    expect(getByText("0 - 0 of 0")).toBeDefined();

    const next = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent === ">"
    )!;
    expect(next.disabled).toBe(true);
    fireEvent.click(next);
    expect(getByText("0 - 0 of 0")).toBeDefined();
  });
});
