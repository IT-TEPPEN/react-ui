import { cleanup, render } from "@testing-library/react";
import Table from "./base";
import { TTableColumn } from "./type";

afterEach(cleanup);

type Row = { name: string };
const cols: TTableColumn<Row>[] = [{ key: "name", type: "string", label: "名前" }];
const rows = [{ id: "1", name: "a" }];

describe("theming", () => {
  test("className and style go on the table's outer element", () => {
    const { container } = render(
      <Table
        cols={cols}
        rows={rows}
        className="employee-list"
        style={{ ["--teppen-table-header-bg" as string]: "#1e3a5f" }}
      />
    );

    const root = container.querySelector('[data-teppen-part="table"]') as HTMLElement;
    expect(root.classList.contains("employee-list")).toBe(true);
    expect(root.style.getPropertyValue("--teppen-table-header-bg")).toBe("#1e3a5f");
  });

  test("parts are marked so that CSS can target them", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);
    const parts = new Set(
      Array.from(container.querySelectorAll("[data-teppen-part]")).map((el) =>
        el.getAttribute("data-teppen-part")
      )
    );

    for (const part of ["table", "search-bar", "header", "header-cell", "body", "row", "cell", "pagination", "range"]) {
      expect(parts.has(part)).toBe(true);
    }
  });

  test("colors come from the CSS variables, with the old colors as defaults", () => {
    const { container } = render(<Table cols={cols} rows={rows} />);
    const header = container.querySelector('[data-teppen-part="header"]')!;
    const body = container.querySelector('[data-teppen-part="body"]')!;

    expect(header.className).toContain("bg-[color:var(--teppen-table-header-bg,#e5e7eb)]");
    expect(body.className).toContain("border-[color:var(--teppen-table-border,#e5e7eb)]");
    expect(body.className).toContain("rounded-b-[var(--teppen-table-radius,0.375rem)]");
  });
});
