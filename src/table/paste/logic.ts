import { MESSAGES, TMessages } from "../locale/messages";
import { TTableColumn } from "../table/type";

type TPasteArgument = {
  pasteData: string[][];
  currentRows: any[];
  currentCols: TTableColumn<any>[];
  tableArea?: {
    start: {
      rowIndex: number;
      colIndex: number;
    };
    end: {
      rowIndex: number;
      colIndex: number;
    };
  };
  pasteArea: {
    start: {
      rowIndex: number;
      colIndex: number;
    };
    end: {
      rowIndex: number;
      colIndex: number;
    };
  };
  validators: {
    [key: string]: (value: any) => boolean;
  };
  /** Messages for the errors. Japanese when omitted. */
  messages?: TMessages["paste"];
};

type TPasteResult =
  | {
      isError: true;
      type:
        | "ValidationError"
        | "NoPasteData"
        | "NOT_ENOUGH_ROWS"
        | "NOT_ENOUGH_COLUMNS"
        | "NOT_EDITABLE_COLUMN";
      message: string;
    }
  | {
      isError: false;
      updateArgument: {
        newRow: any;
        oldRow: any;
      }[];
      pasteRange: {
        start: {
          rowIndex: number;
          colIndex: number;
        };
        end: {
          rowIndex: number;
          colIndex: number;
        };
      };
    };

// A number with thousands separators, as Excel copies formatted numbers.
const GROUPED_NUMBER = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/;

/**
 * Turns pasted text into the form the column's validator expects. For number
 * columns, surrounding spaces and thousands separators ("1,000") are removed.
 */
function normalizePastedValue(col: TTableColumn<any>, value: string): string {
  if (col.type !== "number") {
    return value;
  }

  const trimmed = value.trim();
  return GROUPED_NUMBER.test(trimmed) ? trimmed.replace(/,/g, "") : trimmed;
}

export function paste(args: TPasteArgument): TPasteResult {
  const messages = args.messages ?? MESSAGES.ja.paste;

  // ペーストデータの行数と列数を取得
  const pasteDataRowLength = args.pasteData.length;
  const pasteDataColLength = Math.max(
    ...args.pasteData.map((row) => row.length)
  );

  // ペーストデータが空の場合は何もしない
  if (pasteDataRowLength === 0 || pasteDataColLength === 0) {
    return {
      isError: true,
      type: "NoPasteData",
      message: messages.noData,
    };
  }

  // Rangeの種類を取得
  const rangeRowLength =
    args.pasteArea.end.rowIndex - args.pasteArea.start.rowIndex + 1;
  const rangeColLength =
    args.pasteArea.end.colIndex - args.pasteArea.start.colIndex + 1;

  const pasteRowLength =
    rangeRowLength < pasteDataRowLength ? pasteDataRowLength : rangeRowLength;
  const pasteColLength =
    rangeColLength < pasteDataColLength ? pasteDataColLength : rangeColLength;

  // ペースト先の行数が足りない場合はエラー
  if (
    pasteRowLength + args.pasteArea.start.rowIndex >
    args.currentRows.length
  ) {
    return {
      isError: true,
      type: "NOT_ENOUGH_ROWS",
      message: messages.notEnoughRows,
    };
  }
  // ペースト先の列数が足りない場合はエラー
  if (
    pasteColLength + args.pasteArea.start.colIndex >
    args.currentCols.length
  ) {
    return {
      isError: true,
      type: "NOT_ENOUGH_COLUMNS",
      message: messages.notEnoughColumns,
    };
  }

  // ペースト先の列に編集不可列が含まれている場合はエラー
  for (let i = 0; i < pasteColLength; i++) {
    const col = args.currentCols[args.pasteArea.start.colIndex + i];

    if (!col.editable) {
      return {
        isError: true,
        type: "NOT_EDITABLE_COLUMN",
        message: messages.notEditableColumn(
          col.label ?? (col.key as string)
        ),
      };
    }
  }

  // ペーストデータのバリデーション
  for (let i = 0; i < pasteDataRowLength; i++) {
    const pasteRow = args.pasteData[i];

    for (let j = 0; j < pasteColLength; j++) {
      const colIndexForData = j % pasteRow.length;
      const col = args.currentCols[args.pasteArea.start.colIndex + j];
      const pasteValue = normalizePastedValue(col, pasteRow[colIndexForData]);
      const validate = args.validators[col.key as string];

      if (!validate(pasteValue)) {
        return {
          isError: true,
          type: "ValidationError",
          message: messages.invalidValue(pasteValue),
        };
      }
    }
  }

  const updateArguments: { newRow: any; oldRow: any }[] = [];

  // ペーストデータを反映
  for (let i = 0; i < pasteRowLength; i++) {
    const pasteRow = args.pasteData[i % pasteDataRowLength];
    const newRow = { ...args.currentRows[args.pasteArea.start.rowIndex + i] };
    let checkUpdatedRow = false;

    for (let j = 0; j < pasteColLength; j++) {
      const col = args.currentCols[args.pasteArea.start.colIndex + j];
      const pasteValue = normalizePastedValue(col, pasteRow[j % pasteRow.length]);
      const value =
        col.type === "number"
          ? Number(pasteValue)
          : col.type === "select"
          ? pasteValue === ""
            ? ""
            : col.options.find((option) => option.label === pasteValue)!.value
          : pasteValue;
      if (newRow[col.key] !== value) {
        checkUpdatedRow = true;
        newRow[col.key] = value;
      }
    }

    if (checkUpdatedRow) {
      updateArguments.push({
        newRow,
        oldRow: args.currentRows[args.pasteArea.start.rowIndex + i],
      });
    }
  }

  return {
    isError: false,
    updateArgument: updateArguments,
    pasteRange: {
      start: {
        rowIndex: args.pasteArea.start.rowIndex,
        colIndex: args.pasteArea.start.colIndex,
      },
      end: {
        rowIndex: args.pasteArea.start.rowIndex + pasteRowLength - 1,
        colIndex: args.pasteArea.start.colIndex + pasteColLength - 1,
      },
    },
  };
}
