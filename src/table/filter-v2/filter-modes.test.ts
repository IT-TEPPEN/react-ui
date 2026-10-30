import { act, renderHook } from "@testing-library/react";
import { isMatchCondition, KEYWORD_TARGET_KEY, useFilterHook } from "./hook";
import { buildKeywordTextGetter } from "./keyword";
import { Condition } from "../../search-bar";
import { DEFAULT_SEARCH_OPERATOR } from "../../share/search-operator/constant";
import { TTableColumn } from "../table/type";

const op = (key: string) => DEFAULT_SEARCH_OPERATOR.find((o) => o.key === key)!;

const roleOptions = [
  { value: "1", label: "管理者" },
  { value: "2", label: "ユーザー" },
  { value: "3", label: "ゲスト" },
];

const roleIn = (key: "select:in" | "select:not_in", values: string[]): Condition =>
  ({
    target: { key: "role", label: "役割", type: "select", options: roleOptions },
    operator: op(key),
    input: { type: "multi select", payload: { value: values } },
  }) as Condition;

const nameLike = (value: string): Condition =>
  ({
    target: { key: "name", label: "名前", type: "string" },
    operator: op("string:like"),
    input: { type: "single string", payload: { value } },
  }) as Condition;

const keyword = (value: string, key = "string:like"): Condition =>
  ({
    target: { key: KEYWORD_TARGET_KEY, label: "すべての列", type: "string" },
    operator: op(key),
    input: { type: "single string", payload: { value } },
  }) as Condition;

type Row = { name: string; role: string; born: Date; memo: string };
const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "名前" },
  { key: "role", type: "select", label: "役割", options: roleOptions },
  { key: "born", type: "date", label: "誕生日", render: (v) => `${v.getMonth() + 1}月${v.getDate()}日` },
  { key: "memo", type: "string", label: "メモ", disableFilter: true },
];
const rows = [
  { id: "1", name: "Taro", role: "1", born: new Date(2000, 0, 5), memo: "secret" },
  { id: "2", name: "Hanako", role: "2", born: new Date(1990, 4, 1), memo: "" },
  { id: "3", name: "Jiro", role: "3", born: new Date(1985, 11, 24), memo: "" },
];

describe("in / not in", () => {
  test("in matches any of the values, not in none of them", () => {
    const inCond = roleIn("select:in", ["1", "3"]);
    const notIn = roleIn("select:not_in", ["1", "3"]);
    expect(["1", "2", "3", ""].map((v) => isMatchCondition(inCond, v, inCond.input))).toEqual([true, false, true, false]);
    expect(["1", "2", "3", ""].map((v) => isMatchCondition(notIn, v, notIn.input))).toEqual([false, true, false, true]);
  });
});

describe("keyword text", () => {
  const text = buildKeywordTextGetter(cols);

  test("uses what the columns show", () => {
    expect(text(rows[0])).toContain("Taro");
    expect(text(rows[0])).toContain("管理者");
    expect(text(rows[0])).toContain("1月5日");
    expect(text(rows[0])).toContain("2000-01-05");
  });

  test("leaves out columns with disableFilter", () => {
    expect(text(rows[0])).not.toContain("secret");
  });
});

describe("useFilterHook", () => {
  const ids = (list: { id: string }[]) => list.map((r) => r.id);
  const getText = buildKeywordTextGetter(cols);

  test("combines conditions with AND by default and with OR when set", () => {
    const { result } = renderHook(() =>
      useFilterHook([nameLike("ro"), roleIn("select:in", ["3"])])
    );
    expect(ids(result.current.functions.filter(rows, getText))).toEqual(["3"]);

    act(() => result.current.actions.setMode("or"));
    expect(result.current.state.mode).toBe("or");
    expect(ids(result.current.functions.filter(rows, getText))).toEqual(["1", "3"]);
  });

  test("the keyword condition searches every column", () => {
    const { result } = renderHook(() => useFilterHook([keyword("ゆーざー")]));
    // "ゆーざー" matches the label ユーザー of row 2, ignoring kana type.
    expect(ids(result.current.functions.filter(rows, getText))).toEqual(["2"]);

    const byDate = renderHook(() => useFilterHook([keyword("12月24日")]));
    expect(ids(byDate.result.current.functions.filter(rows, getText))).toEqual(["3"]);

    const notLike = renderHook(() => useFilterHook([keyword("taro", "string:not_like")]));
    expect(ids(notLike.result.current.functions.filter(rows, getText))).toEqual(["2", "3"]);

    const hidden = renderHook(() => useFilterHook([keyword("secret")]));
    expect(ids(hidden.result.current.functions.filter(rows, getText))).toEqual([]);
  });

  test("no conditions return every row", () => {
    const { result } = renderHook(() => useFilterHook([], "or"));
    expect(ids(result.current.functions.filter(rows, getText))).toEqual(["1", "2", "3"]);
  });
});
