import { useCallback, useMemo, useReducer } from "react";
import { useRangeStateContext } from "../range/provider";
import { TCopyReducer, TReturnCopyReducer } from "./types";

const reducer: TCopyReducer = (state, action) => {
  switch (action.type) {
    case "setRows":
      return { ...state, rows: action.payload.rows };
    case "setCols":
      return { ...state, cols: action.payload.cols };
    default:
      return state;
  }
};

export function useCopyReducer(initial: {
  rows: any[];
  cols: any[];
  onUpdateRowFunction?: (newRow: any, oldRow: any) => void;
}): TReturnCopyReducer {
  const [state, dispatch] = useReducer(reducer, {
    ...initial,
  });
  const range = useRangeStateContext();

  const copy = useCallback(() => {
    if (!range.isSelecting) {
      return;
    }

    const startRowIndex = range.start.rowIndex;
    const endRowIndex = range.end.rowIndex;
    const startColIndex = range.start.colIndex;
    const endColIndex = range.end.colIndex;

    const copiedData = state.rows
      .slice(startRowIndex, endRowIndex + 1)
      .map((row) => {
        const copiedRow = [];
        for (let i = startColIndex; i <= endColIndex; i++) {
          const col = state.cols[i];

          if (col.type == "number" || col.type == "string") {
            copiedRow.push(row[col.key]);
            continue;
          } else if (col.type == "select") {
            const value = row[col.key];

            if (value === null || value === undefined || value === "") {
              copiedRow.push("");
            } else {
              copiedRow.push(
                col.options.find((option) => option.value === row[col.key])!
                  .label
              );
            }
          }
        }
        return copiedRow;
      });

    const copiedDataString = copiedData.map((row) => row.join("\t")).join("\n");

    navigator.clipboard.writeText(copiedDataString);
  }, [range, state.rows, state.cols]);

  const setRows = useCallback((rows: any[]) => {
    dispatch({ type: "setRows", payload: { rows } });
  }, []);

  const actions = useMemo(
    () => ({
      copy,
      setRows,
    }),
    [copy, setRows]
  );

  return {
    actions,
  };
}
