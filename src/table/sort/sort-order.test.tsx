import { cleanup, fireEvent, render } from "@testing-library/react";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

afterEach(cleanup);

// Values of column `key` in the order they are shown.
const shown = (container: HTMLElement, col: number) =>
  Array.from(container.querySelectorAll("tbody tr[data-testid]")).map(
    (tr) => tr.querySelectorAll("td")[col].textContent
  );

function clickSort(container: HTMLElement, label: string) {
  const p = Array.from(container.querySelectorAll("p.font-bold")).find(
    (el) => el.textContent === label
  )!;
  fireEvent.click(p.closest("div.relative")!.querySelector("div.cursor-pointer")!);
}

describe("sort order", () => {
  test("text is sorted the Japanese way, with empty values last", () => {
    const names = ["b", "A", "", "いとう", "10", "アベ", "東京", "2", "うえの", "a"];
    const { container } = render(
      <Table
        cols={[{ key: "name", type: "string", label: "名前" }]}
        rows={names.map((name, i) => ({ id: `r${i}`, name }))}
      />
    );

    clickSort(container, "名前");
    expect(shown(container, 0)).toEqual([
      "2", "10", "a", "A", "b", "アベ", "いとう", "うえの", "東京", "",
    ]);

    clickSort(container, "名前");
    expect(shown(container, 0)).toEqual([
      "東京", "うえの", "いとう", "アベ", "b", "A", "a", "10", "2", "",
    ]);
  });

  test("select columns are sorted by their labels", () => {
    const cols: TTableColumn<{ role: string }>[] = [
      {
        key: "role",
        type: "select",
        label: "役割",
        options: [
          { value: "1", label: "ユーザー" },
          { value: "2", label: "管理者" },
          { value: "3", label: "ゲスト" },
        ],
      },
    ];
    const { container } = render(
      <Table
        cols={cols}
        rows={["1", "2", "3"].map((role, i) => ({ id: String(i), role }))}
      />
    );

    clickSort(container, "役割");
    // ゲスト, ユーザー (kana order), then 管理者 (kanji)
    expect(shown(container, 0)).toEqual(["ゲスト", "ユーザー", "管理者"]);
  });

  test("rows with string ids start in numeric order", () => {
    const { container } = render(
      <Table
        cols={[{ key: "name", type: "string", label: "名前" }]}
        rows={Array.from({ length: 12 }, (_, i) => ({
          id: String(i + 1),
          name: `n${i + 1}`,
        }))}
      />
    );

    expect(
      Array.from(container.querySelectorAll("tbody tr[data-testid]")).map((tr) =>
        tr.getAttribute("data-testid")
      )
    ).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);
  });

  test("numbers and dates are sorted by value", () => {
    type Row = { n: number; d: Date };
    const cols: TTableColumn<Row>[] = [
      { key: "n", type: "number", label: "数" },
      { key: "d", type: "date", label: "日付", render: (v) => String(v.getDate()) },
    ];
    const { container } = render(
      <Table
        cols={cols}
        rows={[
          { id: "a", n: 10, d: new Date(2024, 0, 3) },
          { id: "b", n: -1, d: new Date(2024, 0, 1) },
          { id: "c", n: 2, d: new Date(2024, 0, 2) },
        ]}
      />
    );

    clickSort(container, "数");
    expect(shown(container, 0)).toEqual(["-1", "2", "10"]);

    clickSort(container, "日付");
    expect(shown(container, 1)).toEqual(["1", "2", "3"]);
  });
});
