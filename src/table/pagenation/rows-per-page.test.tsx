import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn, TTableCondition } from "../table/type";

type Row = { name: string };
const cols: TTableColumn<Row>[] = [{ key: "name", type: "string", label: "名前" }];
const rows = Array.from({ length: 60 }, (_, i) => ({ id: String(i + 1), name: `n${i + 1}` }));

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

const rowCount = (container: HTMLElement) =>
  container.querySelectorAll("tbody tr[data-testid]").length;
const select = (container: HTMLElement) =>
  container.querySelector('[data-teppen-part="page-size"] select') as HTMLSelectElement | null;
const optionLabels = (container: HTMLElement) =>
  Array.from(select(container)!.options).map((o) => o.textContent);

function renderTable(props: Partial<TPropsTable<Row>> = {}) {
  const reports: TTableCondition[] = [];
  const utils = render(
    <Table cols={cols} rows={rows} onConditionChange={(c) => reports.push(c)} {...props} />
  );
  return { ...utils, last: () => reports[reports.length - 1] };
}

describe("rows per page", () => {
  test("is not shown without rowCountPerPageOptions", () => {
    const { container } = renderTable();
    expect(select(container)).toBeNull();
  });

  test("shows the given choices and the count in use", () => {
    const { container, getByText } = renderTable({ rowCountPerPageOptions: [10, 25, 50, "all"] });

    expect(getByText("表示件数")).toBeDefined();
    expect(optionLabels(container)).toEqual(["10件", "25件", "50件", "すべて"]);
    expect(select(container)!.value).toBe("50");
    expect(rowCount(container)).toBe(50);
  });

  test("changing it shows that many rows from page 1, and is reported", () => {
    const { container, last, getByText } = renderTable({
      rowCountPerPageOptions: [10, 25, 50],
      initialCondition: { pagination: { page: 2, rowCountPerPage: 25 } },
    });
    expect(getByText("60件中 26〜50件")).toBeDefined();

    fireEvent.change(select(container)!, { target: { value: "10" } });

    expect(rowCount(container)).toBe(10);
    expect(getByText("60件中 1〜10件")).toBeDefined();
    expect(last().pagination).toEqual({ rowCountPerPage: 10, page: 1 });
  });

  test('"all" shows every row and keeps the select to switch back', () => {
    const { container, last } = renderTable({ rowCountPerPageOptions: [20, "all"] });

    fireEvent.change(select(container)!, { target: { value: "all" } });
    expect(rowCount(container)).toBe(60);
    expect(last().pagination).toEqual({ rowCountPerPage: "all", page: 1 });

    fireEvent.change(select(container)!, { target: { value: "20" } });
    expect(rowCount(container)).toBe(20);
  });

  test("is shown in English with locale=\"en\"", () => {
    const { container, getByText } = renderTable({ locale: "en", rowCountPerPageOptions: [20, "all"] });

    expect(getByText("Rows per page")).toBeDefined();
    // 50 (the default count) is not a choice, so it is added at the end.
    expect(optionLabels(container)).toEqual(["20", "All", "50"]);
  });

  test("leaves out invalid choices with a warning, and adds the count in use", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = renderTable({
      rowCountPerPageOptions: [0, -5, 2.5, 10, 10, 30],
      initialCondition: { pagination: { rowCountPerPage: 15 } },
    });

    expect(warn).toHaveBeenCalledTimes(3);
    expect(optionLabels(container)).toEqual(["10件", "30件", "15件"]);
    expect(select(container)!.value).toBe("15");
    expect(rowCount(container)).toBe(15);
  });

  test("an invalid rowCountPerPage falls back to 50 with a warning", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = renderTable({ initialCondition: { pagination: { rowCountPerPage: 0 } } });

    expect(warn).toHaveBeenCalled();
    expect(rowCount(container)).toBe(50);
  });

  test("a saved count is restored", () => {
    const first = renderTable({ rowCountPerPageOptions: [10, 25] });
    fireEvent.change(select(first.container)!, { target: { value: "25" } });
    const saved = JSON.parse(JSON.stringify(first.last()));
    first.unmount();

    const second = renderTable({ rowCountPerPageOptions: [10, 25], initialCondition: saved });
    expect(select(second.container)!.value).toBe("25");
    expect(rowCount(second.container)).toBe(25);
  });
});
