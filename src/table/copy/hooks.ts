import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useRangeStateContext } from "../range/provider";
import { TCopyReducer, TReturnCopyReducer } from "./types";

const reducer: TCopyReducer = (state, action) => {
  switch (action.type) {
    case "setRows":
      return { ...state, rows: action.payload.rows };
    case "setCols":
      return { ...state, cols: action.payload.cols };
    case "copied":
      return { ...state, copiedAt: new Date() };
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

  useEffect(() => {
    dispatch({ type: "setCols", payload: { cols: initial.cols } });
  }, [initial.cols]);

  const copy = useCallback(
    (options?: { enableDeprecatedCopy?: boolean }) => {
      if (!range.isSelecting) {
        return;
      }

      const startRowIndex =
        range.start.rowIndex <= range.end.rowIndex
          ? range.start.rowIndex
          : range.end.rowIndex;
      const endRowIndex =
        range.start.rowIndex >= range.end.rowIndex
          ? range.start.rowIndex
          : range.end.rowIndex;
      const startColIndex =
        range.start.colIndex <= range.end.colIndex
          ? range.start.colIndex
          : range.end.colIndex;
      const endColIndex =
        range.start.colIndex >= range.end.colIndex
          ? range.start.colIndex
          : range.end.colIndex;

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
            } else if (col.type === "datetime") {
              copiedRow.push(row[col.key].toISOString());
            }
          }
          return copiedRow;
        });

      const copiedDataString = copiedData
        .map((row) => row.join("\t"))
        .join("\n");

      if (options?.enableDeprecatedCopy) {
        const textArea = document.createElement("textarea");
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        textArea.value = copiedDataString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } else {
        navigator.clipboard.writeText(copiedDataString);
      }

      dispatch({ type: "copied" });
    },
    [range, state.rows, state.cols]
  );

  const setRows = useCallback((rows: any[]) => {
    dispatch({ type: "setRows", payload: { rows } });
  }, []);

  const states = useMemo(
    () => ({
      copiedAt: state.copiedAt,
    }),
    [state.copiedAt]
  );

  const actions = useMemo(
    () => ({
      copy,
      setRows,
    }),
    [copy, setRows]
  );

  return {
    states,
    actions,
  };
}
