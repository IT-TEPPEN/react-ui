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
};

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
  copied: "コピーしました!!!",
  selectNone: "-- 未選択 --",
  selectClear: "-- 選択解除 --",
  selectPlaceholder: "選択してください",
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
  copied: "Copied!",
  selectNone: "-- None --",
  selectClear: "-- Clear --",
  selectPlaceholder: "Select...",
};

export const MESSAGES: Record<TLocale, TMessages> = { ja, en };
