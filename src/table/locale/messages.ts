import type { TErrorValidation } from "../libs/generate-validate-function";

/** Language of the messages the table shows by itself. */
export type TLocale = "ja" | "en";

export type TMessages = {
  /** Message shown by the default errorHandler (window.alert). */
  validation: (errors: TErrorValidation[]) => string;
  paste: {
    noData: string;
    notEnoughRows: string;
    notEnoughColumns: string;
    notEditableColumn: (column: string) => string;
    invalidValue: (value: string) => string;
  };
  copied: string;
  /** Empty option of a select cell when the cell is empty / has a value. */
  selectNone: string;
  selectClear: string;
  selectPlaceholder: string;
  /** Search bar target that searches every column. */
  allColumns: string;
  search: {
    selectColumn: string;
    selectCondition: string;
    enterValue: string;
    selectValue: string;
    /** Button that adds the values chosen for "is any of" / "is none of". */
    add: string;
    /** The AND / OR toggle. */
    matchAll: string;
    matchAny: string;
    /** Explains what clicking the toggle does. */
    modeHint: (mode: "and" | "or") => string;
    /** Label of an operator, by its key such as "string:like". */
    operator: (key: string) => string;
    /** A condition as shown in the search bar. `value` is null when none. */
    condition: (column: string, operatorKey: string, value: string | null) => string;
    /** Separator between several values. */
    valueSeparator: string;
  };
  /** BCP 47 tag used to format dates in conditions. */
  dateLocale: string;
  /** Shown when the table has no rows. */
  noData: string;
  /** Shown when rows exist but none pass the filters. */
  noMatch: string;
  loading: string;
  /** Page navigation under the table. */
  pagination: {
    label: string;
    prev: string;
    next: string;
    /** Accessible name of a page number button. */
    goToPage: (page: number) => string;
  };
  /** Label of the rows-per-page select. */
  rowsPerPage: string;
  /** A rows-per-page choice: 50 -> "50件" / "50", "all" -> "すべて" / "All". */
  rowsPerPageOption: (count: number | "all") => string;
  /** The column selector (see the columnSelector prop). */
  columnSelector: {
    button: string;
    title: string;
    showAll: string;
  };
  /** Row range under the table, e.g. "1–20 of 36". */
  range: (from: number, to: number, total: number) => string;
};

const JA_OPERATORS: Record<string, string> = {
  like: "を含む",
  not_like: "を含まない",
  eq: "と等しい",
  neq: "と等しくない",
  gt: "より大きい",
  gte: "以上",
  lt: "より小さい",
  lte: "以下",
  "date:gt": "より後",
  "date:gte": "以降",
  "date:lt": "より前",
  "date:lte": "以前",
  in: "のいずれか",
  not_in: "のいずれでもない",
  is_null: "が空欄",
  is_not_null: "が空欄でない",
};

const EN_OPERATORS: Record<string, string> = {
  like: "contains",
  not_like: "does not contain",
  eq: "is",
  neq: "is not",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  "date:gt": "after",
  "date:gte": "on or after",
  "date:lt": "before",
  "date:lte": "on or before",
  in: "is any of",
  not_in: "is none of",
  is_null: "is empty",
  is_not_null: "is not empty",
};

// "date:gt" and "datetime:gt" read as dates; other types use the operator
// name alone ("string:like" -> "like").
function operatorLabel(labels: Record<string, string>, key: string): string {
  const [type, name] = key.split(":");
  const dateKey = `date:${name}`;
  if ((type === "date" || type === "datetime") && labels[dateKey]) {
    return labels[dateKey];
  }
  return labels[name] ?? name;
}

const ja: TMessages = {
  validation: (errors) => {
    let message = `入力値が不正のため、エラーを確認し修正してください。\n\n`;
    message += `[対象の列名]: ${errors[0].label}\n`;
    message += `[入力値]　　: ${errors[0].value}\n\n`;
    message += `[エラー内容]:`;
    return (
      message +
      errors
        .map((error) => {
          switch (error.type) {
            case "STRING_IS_TOO_LONG":
              return `\n・文字数が最大の長さ${error.maxLength}文字を超えています。(現在${error.currentLength}文字)`;
            case "STRING_IS_TOO_SHORT":
              return `\n・文字数が最小の長さ${error.minLength}文字に満たないです。(現在${error.currentLength}文字)`;
            case "STRING_PATTERN_NOT_MATCH":
              return `\n・パターンに一致しません。(パターン${error.pattern})`;
            case "NUMBER_IS_TOO_LARGE":
              return `\n・最大値${error.max}を超えています。(入力値${error.value})`;
            case "NUMBER_IS_TOO_SMALL":
              return `\n・最小値${error.min}を下回っています。(入力値${error.value})`;
            case "NOT_NUMBER":
              return `\n・数値ではない値が入力されています。`;
            case "NOT_IN_OPTIONS":
              return `\n・選択肢に含まれていない値です。`;
            case "NOT_DATE":
              return `\n・日付の形式ではありません。`;
            case "NOT_DATETIME":
              return `\n・日時の形式ではありません。`;
          }
        })
        .join("")
    );
  },
  paste: {
    noData: "ペーストデータがありません。",
    notEnoughRows: "貼り付け先の行数が足りません。",
    notEnoughColumns: "貼り付け先の列数が足りません。",
    notEditableColumn: (column) =>
      `編集できない列にデータを貼り付けることはできません。\n\n編集不可列: ${column}`,
    invalidValue: (value) => `バリデーションエラー: ${value}`,
  },
  copied: "コピーしました",
  selectNone: "-- 未選択 --",
  selectClear: "-- 選択解除 --",
  selectPlaceholder: "選択してください",
  allColumns: "すべての列",
  search: {
    selectColumn: "絞り込む列を選択",
    selectCondition: "条件を選択",
    enterValue: "値を入力して Enter",
    selectValue: "値を選択",
    add: "追加",
    matchAll: "すべてに一致",
    matchAny: "どれかに一致",
    modeHint: (mode) =>
      mode === "and"
        ? "すべての条件に一致する行を表示中。押すと、どれかの条件に一致する行を表示します"
        : "どれかの条件に一致する行を表示中。押すと、すべての条件に一致する行を表示します",
    operator: (key) => operatorLabel(JA_OPERATORS, key),
    condition: (column, operatorKey, value) => {
      const op = operatorLabel(JA_OPERATORS, operatorKey);
      return value === null ? `${column} ${op}` : `${column}：${value} ${op}`;
    },
    valueSeparator: "、",
  },
  dateLocale: "ja-JP",
  noData: "データがありません",
  noMatch: "条件に一致するデータがありません",
  loading: "読み込み中…",
  pagination: {
    label: "ページ送り",
    prev: "前へ",
    next: "次へ",
    goToPage: (page) => `${page}ページ目`,
  },
  rowsPerPage: "表示件数",
  rowsPerPageOption: (count) => (count === "all" ? "すべて" : `${count}件`),
  columnSelector: {
    button: "表示列",
    title: "表示する列",
    showAll: "すべて表示",
  },
  range: (from, to, total) =>
    total === 0 ? "0件" : `${total}件中 ${from}〜${to}件`,
};

const en: TMessages = {
  validation: (errors) => {
    let message = `The value is not valid. Please check the errors and fix it.\n\n`;
    message += `[Column]: ${errors[0].label}\n`;
    message += `[Value] : ${errors[0].value}\n\n`;
    message += `[Errors]:`;
    return (
      message +
      errors
        .map((error) => {
          switch (error.type) {
            case "STRING_IS_TOO_LONG":
              return `\n- Must be at most ${error.maxLength} characters (currently ${error.currentLength}).`;
            case "STRING_IS_TOO_SHORT":
              return `\n- Must be at least ${error.minLength} characters (currently ${error.currentLength}).`;
            case "STRING_PATTERN_NOT_MATCH":
              return `\n- Does not match the pattern ${error.pattern}.`;
            case "NUMBER_IS_TOO_LARGE":
              return `\n- Must be ${error.max} or less (got ${error.value}).`;
            case "NUMBER_IS_TOO_SMALL":
              return `\n- Must be ${error.min} or more (got ${error.value}).`;
            case "NOT_NUMBER":
              return `\n- Must be a number.`;
            case "NOT_IN_OPTIONS":
              return `\n- Must be one of the options.`;
            case "NOT_DATE":
              return `\n- Must be a date.`;
            case "NOT_DATETIME":
              return `\n- Must be a date and time.`;
          }
        })
        .join("")
    );
  },
  paste: {
    noData: "There is no data to paste.",
    notEnoughRows: "There are not enough rows to paste into.",
    notEnoughColumns: "There are not enough columns to paste into.",
    notEditableColumn: (column) =>
      `Data cannot be pasted into a column that is not editable.\n\nColumn: ${column}`,
    invalidValue: (value) => `Invalid value: ${value}`,
  },
  copied: "Copied",
  selectNone: "-- None --",
  selectClear: "-- Clear --",
  selectPlaceholder: "Select...",
  allColumns: "All columns",
  search: {
    selectColumn: "Filter by column",
    selectCondition: "Choose a condition",
    enterValue: "Type a value and press Enter",
    selectValue: "Choose a value",
    add: "Add",
    matchAll: "Match all",
    matchAny: "Match any",
    modeHint: (mode) =>
      mode === "and"
        ? "Showing rows that match all conditions. Click to show rows that match any."
        : "Showing rows that match any condition. Click to show rows that match all.",
    operator: (key) => operatorLabel(EN_OPERATORS, key),
    condition: (column, operatorKey, value) => {
      const op = operatorLabel(EN_OPERATORS, operatorKey);
      return value === null ? `${column} ${op}` : `${column} ${op} ${value}`;
    },
    valueSeparator: ", ",
  },
  dateLocale: "en-US",
  noData: "No data",
  noMatch: "No rows match the filters",
  loading: "Loading…",
  pagination: {
    label: "Pagination",
    prev: "Prev",
    next: "Next",
    goToPage: (page) => `Page ${page}`,
  },
  rowsPerPage: "Rows per page",
  rowsPerPageOption: (count) => (count === "all" ? "All" : String(count)),
  columnSelector: {
    button: "Columns",
    title: "Shown columns",
    showAll: "Show all",
  },
  range: (from, to, total) =>
    total === 0 ? "0 rows" : `${from}–${to} of ${total}`,
};

export const MESSAGES: Record<TLocale, TMessages> = { ja, en };
