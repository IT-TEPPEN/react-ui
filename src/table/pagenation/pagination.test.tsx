import { cleanup, fireEvent, render, within } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = { name: string };
const cols: TTableColumn<Row>[] = [{ key: "name", type: "string", label: "名前" }];
const rows = Array.from({ length: 120 }, (_, i) => ({ id: String(i + 1), name: `n${i + 1}` }));

afterEach(cleanup);

function renderTable(locale?: "ja" | "en") {
  const utils = render(
    <Table
      cols={cols}
      rows={rows}
      locale={locale}
      initialCondition={{ pagination: { rowCountPerPage: 10 } }}
    />
  );
  const nav = () => utils.getByRole("navigation");
  // Page numbers and gaps: the nav's own children, without prev / next.
  const items = () =>
    Array.from(nav().children)
      .filter((el) => el.matches("button[aria-label], span"))
      .map((el) => el.textContent);
  const firstId = () =>
    utils.container.querySelector("tbody tr[data-testid]")?.getAttribute("data-testid");
  return { ...utils, nav, items, firstId };
}

describe("pagination", () => {
  test("shows the first and the last page, so the number of pages is visible", () => {
    const { items } = renderTable();
    expect(items()).toEqual(["1", "2", "3", "4", "5", "6", "7", "…", "12"]);
  });

  test("the last page is one click away", () => {
    const { nav, firstId, items } = renderTable();

    fireEvent.click(within(nav()).getByRole("button", { name: "12ページ目" }));
    expect(firstId()).toBe("111");
    expect(items()).toEqual(["1", "…", "6", "7", "8", "9", "10", "11", "12"]);
  });

  test("marks the current page and disables the buttons that cannot be used", () => {
    const { nav } = renderTable();

    expect(within(nav()).getByRole("button", { name: "1ページ目" }).getAttribute("aria-current")).toBe("page");
    expect((within(nav()).getByRole("button", { name: /前へ/ }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(within(nav()).getByRole("button", { name: "12ページ目" }));
    expect((within(nav()).getByRole("button", { name: /次へ/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((within(nav()).getByRole("button", { name: /前へ/ }) as HTMLButtonElement).disabled).toBe(false);
  });

  test("prev / next move one page, with gaps around the current page in the middle", () => {
    const { nav, items, firstId } = renderTable();

    fireEvent.click(within(nav()).getByRole("button", { name: "5ページ目" }));
    fireEvent.click(within(nav()).getByRole("button", { name: /次へ/ }));
    expect(firstId()).toBe("51");
    expect(items()).toEqual(["1", "…", "4", "5", "6", "7", "8", "…", "12"]);

    fireEvent.click(within(nav()).getByRole("button", { name: /前へ/ }));
    expect(firstId()).toBe("41");
  });

  test("is labelled in English with locale=\"en\"", () => {
    const { nav } = renderTable("en");

    expect(nav().getAttribute("aria-label")).toBe("Pagination");
    expect(within(nav()).getByRole("button", { name: /Prev/ })).toBeDefined();
    expect(within(nav()).getByRole("button", { name: "Page 12" })).toBeDefined();
  });

  test("with a single page, prev and next cannot be used and there is no gap", () => {
    const { getByRole } = render(
      <Table cols={cols} rows={rows.slice(0, 7)} initialCondition={{ pagination: { rowCountPerPage: 10 } }} />
    );
    const nav = getByRole("navigation");

    expect(Array.from(nav.children).map((el) => el.textContent)).toEqual(["‹前へ", "1", "次へ›"]);
    expect((within(nav).getByRole("button", { name: /前へ/ }) as HTMLButtonElement).disabled).toBe(true);
    expect((within(nav).getByRole("button", { name: /次へ/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  test("with 6 pages every page is shown without gaps", () => {
    const { getByRole } = render(
      <Table cols={cols} rows={rows.slice(0, 60)} initialCondition={{ pagination: { rowCountPerPage: 10 } }} />
    );
    const nav = getByRole("navigation");

    fireEvent.click(within(nav).getByRole("button", { name: "4ページ目" }));
    expect(Array.from(nav.children).map((el) => el.textContent)).toEqual([
      "‹前へ", "1", "2", "3", "4", "5", "6", "次へ›",
    ]);
  });
});
