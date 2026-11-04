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
    /** Placeholder of the search box, without / with conditions. */
    placeholder: string;
    placeholderMore: string;
    /** First option while typing a word: search every column for it. */
    searchEverywhere: (text: string) => string;
    /** Title of the panel for the all-columns search. */
    everywhereTitle: string;
    /** How the conditions combine (one button that switches). */
    matchAll: string;
    matchAny: string;
    /** Explains what clicking the switch does. */
    modeHint: (mode: "and" | "or") => string;
    /** Short name of a condition, on its button in the panel. */
    choice: (operatorKey: string) => string;
    /**
     * What follows the column name in a condition, e.g. " が 営業部" or
     * " ≥ 30". `values` is empty when the condition has no value.
     */
    phrase: (operatorKey: string, values: string[]) => string;
    /** Separator between several values. */
    valueSeparator: string;
    /** Kind of a column, shown in the panel. */
    typeName: (type: "string" | "number" | "date" | "datetime" | "select") => string;
    /** The panel's buttons, hints and messages. */
    add: string;
    change: string;
    remove: string;
    preview: string;
    enterKey: string;
    escapeKey: string;
    needValue: string;
    needChoice: string;
    valuePlaceholder: string;
    /** "+ N" for conditions folded away, and its accessible name. */
    more: (count: number) => string;
    moreLabel: (count: number) => string;
    clearAll: string;
    /** Accessible names. */
    editCondition: string;
    removeCondition: string;
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
  /** Shown under the cell being edited. */
  editHint: { enter: string; tab: string; escape: string };
  /** Shown with an error under the cell being edited. */
  escapeToRevert: string;
  /** In a select cell's options when typing matches none. */
  noOptions: string;
  /** Shown when typing on a column that cannot be edited. */
  readOnlyColumn: string;
  /** One short line for an invalid value, shown under the cell. */
  validationShort: (error: TErrorValidation) => string;
  /** Tooltip of the sort button. */
  sortHint: string;
  /** The column selector (see the columnSelector prop). */
  columnSelector: {
    button: string;
    title: string;
    showAll: string;
  };
  /** Row range under the table, e.g. "1–20 of 36". */
  range: (from: number, to: number, total: number) => string;
};

const SYMBOLS: Record<string, string> = { eq: "=", neq: "≠", gt: ">", gte: "≥", lt: "<", lte: "≤" };

// Splits "date:gte" into its column type and the operator name.
function splitKey(key: string) {
  const [type, name] = key.split(":");
  return { type, name };
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
    placeholder: "言葉で探す、または列を選ぶ",
    placeholderMore: "条件を追加",
    searchEverywhere: (text) => `「${text}」をすべての列から探す`,
    everywhereTitle: "すべての列から探す",
    matchAll: "すべて満たす",
    matchAny: "どれか満たす",
    modeHint: (mode) =>
      mode === "and"
        ? "すべての条件を満たす行を表示中。押すと、どれかの条件を満たす行を表示します"
        : "どれかの条件を満たす行を表示中。押すと、すべての条件を満たす行を表示します",
    choice: (key) => {
      const { type, name } = splitKey(key);
      if (name === "is_null") return "空欄";
      if (name === "is_not_null") return "空欄でない";
      if (type === "string") {
        return { like: "を含む", not_like: "を含まない", eq: "と同じ", neq: "と違う" }[name] ?? name;
      }
      if (type === "select") return name === "in" || name === "eq" ? "が" : "以外";
      if (type === "date" || type === "datetime") {
        return { gte: "以降", lte: "以前", eq: "の日", neq: "以外の日", gt: "より後", lt: "より前" }[name] ?? name;
      }
      return SYMBOLS[name] ?? name;
    },
    phrase: (key, values) => {
      const { type, name } = splitKey(key);
      const v = values.join("・");
      if (name === "is_null") return " が空欄";
      if (name === "is_not_null") return " が空欄でない";
      if (type === "string") {
        return { like: ` に「${v}」を含む`, not_like: ` に「${v}」を含まない`, eq: ` が「${v}」`, neq: ` が「${v}」以外` }[name] ?? ` ${name} ${v}`;
      }
      if (type === "select") {
        if (name === "in" || name === "eq") return values.length > 1 ? ` が ${v} のどれか` : ` が ${v}`;
        return ` が ${v} 以外`;
      }
      if (type === "date" || type === "datetime") {
        return { gte: ` が ${v} 以降`, lte: ` が ${v} 以前`, eq: ` が ${v}`, neq: ` が ${v} 以外`, gt: ` が ${v} より後`, lt: ` が ${v} より前` }[name] ?? ` ${name} ${v}`;
      }
      return ` ${SYMBOLS[name] ?? name} ${v}`;
    },
    valueSeparator: "・",
    typeName: (type) => ({ string: "文字", number: "数値", date: "日付", datetime: "日時", select: "選択肢" })[type],
    add: "追加",
    change: "変更",
    remove: "外す",
    preview: "この条件：",
    enterKey: "適用",
    escapeKey: "閉じる",
    needValue: "値を入れてください",
    needChoice: "1つ以上選んでください",
    valuePlaceholder: "値",
    more: (count) => `ほか${count}件`,
    moreLabel: (count) => `ほかの条件${count}件をすべて表示`,
    clearAll: "すべて解除",
    editCondition: "クリックで変更",
    removeCondition: "この条件を外す",
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
  editHint: { enter: "確定", tab: "確定して右へ", escape: "取り消し" },
  escapeToRevert: "で元に戻す",
  readOnlyColumn: "この列は編集できません",
  noOptions: "一致する選択肢がありません",
  validationShort: (error) => {
    switch (error.type) {
      case "STRING_IS_TOO_LONG":
        return `${error.maxLength}文字以内で入力してください（今 ${error.currentLength}文字）`;
      case "STRING_IS_TOO_SHORT":
        return `${error.minLength}文字以上で入力してください（今 ${error.currentLength}文字）`;
      case "STRING_PATTERN_NOT_MATCH":
        return `決められた形式で入力してください（${error.pattern}）`;
      case "NUMBER_IS_TOO_LARGE":
        return `${error.max}以下で入力してください`;
      case "NUMBER_IS_TOO_SMALL":
        return `${error.min}以上で入力してください`;
      case "NOT_NUMBER":
        return "数値で入力してください";
      case "NOT_IN_OPTIONS":
        return "選択肢にない値です";
      case "NOT_DATE":
        return "日付の形式で入力してください";
      case "NOT_DATETIME":
        return "日時の形式で入力してください";
    }
  },
  sortHint: "クリック：この列で並べ替え／Shift+クリック：並べ替えの条件に追加",
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
    placeholder: "Search, or choose a column",
    placeholderMore: "Add a condition",
    searchEverywhere: (text) => `Search all columns for "${text}"`,
    everywhereTitle: "Search all columns",
    matchAll: "Match all",
    matchAny: "Match any",
    modeHint: (mode) =>
      mode === "and"
        ? "Showing rows that match all conditions. Click to show rows that match any."
        : "Showing rows that match any condition. Click to show rows that match all.",
    choice: (key) => {
      const { type, name } = splitKey(key);
      if (name === "is_null") return "is empty";
      if (name === "is_not_null") return "is not empty";
      if (type === "string") {
        return { like: "contains", not_like: "doesn't contain", eq: "is", neq: "is not" }[name] ?? name;
      }
      if (type === "select") return name === "in" || name === "eq" ? "is" : "is not";
      if (type === "date" || type === "datetime") {
        return { gte: "on or after", lte: "on or before", eq: "on", neq: "not on", gt: "after", lt: "before" }[name] ?? name;
      }
      return SYMBOLS[name] ?? name;
    },
    phrase: (key, values) => {
      const { type, name } = splitKey(key);
      const v = values.join(", ");
      if (name === "is_null") return " is empty";
      if (name === "is_not_null") return " is not empty";
      if (type === "string") {
        return { like: ` contains "${v}"`, not_like: ` doesn't contain "${v}"`, eq: ` is "${v}"`, neq: ` is not "${v}"` }[name] ?? ` ${name} ${v}`;
      }
      if (type === "select") {
        if (name === "in" || name === "eq") return values.length > 1 ? ` is any of ${v}` : ` is ${v}`;
        return values.length > 1 ? ` is none of ${v}` : ` is not ${v}`;
      }
      if (type === "date" || type === "datetime") {
        return { gte: ` on or after ${v}`, lte: ` on or before ${v}`, eq: ` on ${v}`, neq: ` not on ${v}`, gt: ` after ${v}`, lt: ` before ${v}` }[name] ?? ` ${name} ${v}`;
      }
      return ` ${SYMBOLS[name] ?? name} ${v}`;
    },
    valueSeparator: ", ",
    typeName: (type) => ({ string: "Text", number: "Number", date: "Date", datetime: "Date and time", select: "Options" })[type],
    add: "Add",
    change: "Change",
    remove: "Remove",
    preview: "This condition: ",
    enterKey: "apply",
    escapeKey: "close",
    needValue: "Enter a value",
    needChoice: "Choose at least one",
    valuePlaceholder: "Value",
    more: (count) => `+${count} more`,
    moreLabel: (count) => `Show ${count} more conditions`,
    clearAll: "Clear all",
    editCondition: "click to change",
    removeCondition: "Remove this condition",
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
  editHint: { enter: "save", tab: "save and go right", escape: "cancel" },
  escapeToRevert: "to undo",
  readOnlyColumn: "This column cannot be edited",
  noOptions: "No matching option",
  validationShort: (error) => {
    switch (error.type) {
      case "STRING_IS_TOO_LONG":
        return `Use at most ${error.maxLength} characters (now ${error.currentLength})`;
      case "STRING_IS_TOO_SHORT":
        return `Use at least ${error.minLength} characters (now ${error.currentLength})`;
      case "STRING_PATTERN_NOT_MATCH":
        return `Use the required format (${error.pattern})`;
      case "NUMBER_IS_TOO_LARGE":
        return `Enter ${error.max} or less`;
      case "NUMBER_IS_TOO_SMALL":
        return `Enter ${error.min} or more`;
      case "NOT_NUMBER":
        return "Enter a number";
      case "NOT_IN_OPTIONS":
        return "Not one of the options";
      case "NOT_DATE":
        return "Enter a date";
      case "NOT_DATETIME":
        return "Enter a date and time";
    }
  },
  sortHint: "Click: sort by this column / Shift+click: add to the sort",
  columnSelector: {
    button: "Columns",
    title: "Shown columns",
    showAll: "Show all",
  },
  range: (from, to, total) =>
    total === 0 ? "0 rows" : `${from}–${to} of ${total}`,
};

export const MESSAGES: Record<TLocale, TMessages> = { ja, en };
