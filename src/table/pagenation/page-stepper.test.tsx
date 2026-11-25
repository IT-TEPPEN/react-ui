import { cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "../table/base";
import { TPropsTable, TTableColumn, TTableCondition } from "../table/type";

type Row = { name: string };
const cols: TTableColumn<Row>[] = [{ key: "name", type: "string", label: "名前" }];
const rows = Array.from({ length: 45 }, (_, i) => ({ id: String(i + 1), name: `n${i + 1}` }));

afterEach(cleanup);

function renderTable(props: Partial<TPropsTable<Row>> = {}) {
  const reports: TTableCondition[] = [];
  const utils = render(
    <Table
      id="P"
      cols={cols}
      rows={rows}
      initialCondition={{ pagination: { rowCountPerPage: 20 } }}
      onConditionChange={(c) => reports.push(c)}
      {...props}
    />
  );
  const stepper = () =>
    utils.container.querySelector('[data-teppen-part="page-stepper"]') as HTMLElement | null;
  const firstId = () =>
    utils.container.querySelector("tbody tr[data-testid]")?.getAttribute("data-testid");
  const body = () => utils.container.querySelector('[data-teppen-part="body"]') as HTMLElement;
  return { ...utils, stepper, firstId, body, last: () => reports[reports.length - 1] };
}

test("above the table, it shows the rows shown and moves a page with ‹ ›", () => {
  const { stepper, firstId, last } = renderTable();
  const nav = stepper()!;
  expect(nav.getAttribute("aria-label")).toBe("ページ送り（表の上）");
  // Next to the search bar, in the header.
  expect(nav.closest('[data-teppen-part="header"]')).not.toBeNull();
  expect(nav.textContent).toContain("45件中 1〜20件");

  const prev = within(nav).getByRole("button", { name: "前へ" }) as HTMLButtonElement;
  const next = within(nav).getByRole("button", { name: "次へ" }) as HTMLButtonElement;
  expect(prev.disabled).toBe(true);

  fireEvent.click(next);
  expect(firstId()).toBe("21");
  expect(stepper()!.textContent).toContain("45件中 21〜40件");
  expect(last().pagination).toEqual({ rowCountPerPage: 20, page: 2 });

  fireEvent.click(next);
  expect(stepper()!.textContent).toContain("45件中 41〜45件");
  expect(next.disabled).toBe(true);

  fireEvent.click(prev);
  expect(firstId()).toBe("21");
});

test("it is left out with one page, with every row shown, or with paginationPosition=\"bottom\"", () => {
  expect(renderTable({ rows: rows.slice(0, 20) }).stepper()).toBeNull();
  cleanup();
  expect(
    renderTable({ initialCondition: { pagination: { rowCountPerPage: "all" } } }).stepper()
  ).toBeNull();
  cleanup();
  const bottomOnly = renderTable({ paginationPosition: "bottom" });
  expect(bottomOnly.stepper()).toBeNull();
  // The navigation under the table is still there.
  expect(bottomOnly.getByRole("navigation", { name: "ページ送り" })).toBeDefined();
});

test("it is labelled in English with locale=\"en\"", () => {
  const nav = renderTable({ locale: "en" }).stepper()!;
  expect(nav.getAttribute("aria-label")).toBe("Pagination (above the table)");
  expect(nav.textContent).toContain("1–20 of 45");
  expect(within(nav).getByRole("button", { name: "Next" })).toBeDefined();
});

describe("after the page changes, the page is shown from its first row", () => {
  const scrollIntoView = jest.fn();
  beforeAll(() => {
    Element.prototype.scrollIntoView = scrollIntoView;
  });
  beforeEach(() => scrollIntoView.mockClear());

  function placeTable(container: HTMLElement, top: number) {
    const table = container.querySelector('[data-teppen-part="table"]') as HTMLElement;
    table.getBoundingClientRect = () => ({ top } as DOMRect);
  }

  test("the rows go back to the top, and the page scrolls up to the table", () => {
    const { container, body, getByRole } = renderTable();
    body().scrollTop = 300;
    placeTable(container, -900); // scrolled down past the table's top

    fireEvent.click(
      within(getByRole("navigation", { name: "ページ送り" })).getByRole("button", { name: /次へ/ })
    );

    expect(body().scrollTop).toBe(0);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  test("the page does not move when the table's top is on the screen", () => {
    const { container, stepper, body } = renderTable();
    body().scrollTop = 300;
    placeTable(container, 40);

    fireEvent.click(within(stepper()!).getByRole("button", { name: "次へ" }));

    expect(body().scrollTop).toBe(0);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  test("nothing moves on the first render or when the page stays the same", () => {
    const { container, body, rerender } = renderTable();
    placeTable(container, -900);
    body().scrollTop = 300;
    // New rows (e.g. an edit saved) on the same page.
    rerender(
      <Table
        id="P"
        cols={cols}
        rows={rows.map((r) => ({ ...r, name: r.name + "!" }))}
        initialCondition={{ pagination: { rowCountPerPage: 20 } }}
      />
    );
    expect(body().scrollTop).toBe(300);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
