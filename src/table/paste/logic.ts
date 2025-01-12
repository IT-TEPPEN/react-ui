import { TTableColumn } from "../table/type";

type TPasteArgument = {
  pasteData: string[][];
  currentRows: any[];
  currentCols: TTableColumn<any>[];
  tableArea: {
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
};

type TPasteResult =
  | {
      isError: true;
      type: "ValidationError" | "NoPasteData" | "OtherError";
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

export function paste(args: TPasteArgument): TPasteResult {
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
      message: "ペーストデータがありません。",
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
      type: "OtherError",
      message: "貼り付け先の行数が足りません。",
    };
  }
  // ペースト先の列数が足りない場合はエラー
  if (
    pasteColLength + args.pasteArea.start.colIndex >
    args.currentCols.length
  ) {
    return {
      isError: true,
      type: "OtherError",
      message: "貼り付け先の列数が足りません。",
    };
  }

  // ペースト先の列に編集不可列が含まれている場合はエラー
  for (let i = 0; i < pasteColLength; i++) {
    const col = args.currentCols[args.pasteArea.start.colIndex + i];

    if (!col.editable) {
      return {
        isError: true,
        type: "OtherError",
        message: `編集できない列にデータを貼り付けることはできません。\n\n編集不可列: ${
          col.label ?? (col.key as string)
        }`,
      };
    }
  }

  // ペーストデータのバリデーション
  for (let i = 0; i < pasteDataRowLength; i++) {
    const pasteRow = args.pasteData[i];

    for (let j = 0; j < pasteColLength; j++) {
      const colIndexForData = j % pasteRow.length;
      const pasteValue = pasteRow[colIndexForData];
      const col = args.currentCols[args.pasteArea.start.colIndex + j];
      const validate = args.validators[col.key as string];

      if (!validate(pasteValue)) {
        return {
          isError: true,
          type: "ValidationError",
          message: `バリデーションエラー: ${pasteValue}`,
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
      const pasteValue = pasteRow[j % pasteRow.length];
      const col = args.currentCols[args.pasteArea.start.colIndex + j];
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
