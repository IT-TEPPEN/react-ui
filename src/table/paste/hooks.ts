import { useCallback, useEffect, useMemo, useReducer } from "react";
import { TPasteReducer, TPasteReducerReturn } from "./types";
import { useColumnValidatesContext } from "../sheet/providers";
import { useFocusStateContext } from "../focus/provider";

const reducer: TPasteReducer = (state, action) => {
  switch (action.type) {
    case "setRows":
      return { ...state, rows: action.payload.rows };
    case "setCols":
      return { ...state, cols: action.payload.cols };
    case "setColValidators":
      return { ...state, colValidators: action.payload.colValidators };
    case "setOnUpdateRowFunction":
      return {
        ...state,
        onUpdateRowFunction: action.payload.onUpdateRowFunction,
      };
    case "onPaste":
      if (!state.isFocused) {
        return state;
      }

      const { pasteData } = action.payload;
      const {
        rows,
        cols,
        colValidators,
        rowIndex,
        colIndex,
        onUpdateRowFunction,
      } = state;

      if (!onUpdateRowFunction) {
        return state;
      }

      const updateParameters = {
        arguments: [] as { newRow: any; oldRow: any }[],
        timing: state.updateParameters.timing + 1,
      };

      const rowLength = pasteData.length;
      const colLength = Math.max(...pasteData.map((row) => row.length));

      if (rowLength === 0 || colLength === 0) return state;

      if (pasteData.length + rowIndex > rows.length) {
        alert("貼り付け先の行数が足りません。");
        return state;
      }

      for (let i = 0; i < colLength; i++) {
        const col = cols[colIndex + i];

        if (!col.editable) {
          alert(
            `編集できない列にデータを貼り付けることはできません。\n\n編集不可列: ${
              col.label ?? (col.key as string)
            }`
          );
          return state;
        }
      }

      if (colLength + colIndex > cols.length) {
        alert("貼り付け先の列数が足りません。");
        return state;
      }

      for (let i = 0; i < rowLength; i++) {
        const pasteRow = pasteData[i];

        for (let j = 0; j < pasteRow.length; j++) {
          const pasteValue = pasteRow[j];
          const col = cols[colIndex + j];
          const validate = colValidators[col.key as string];

          if (!validate(pasteValue)) {
            return state;
          }
        }
      }

      pasteData.forEach((pasteRow, i) => {
        const row = { ...rows[rowIndex + i] };
        let checkUpdatedRow = false;

        pasteRow.forEach((pasteValue, j) => {
          const col = cols[colIndex + j];
          const value =
            col.type === "number"
              ? Number(pasteValue)
              : col.type === "select"
              ? pasteValue === ""
                ? ""
                : col.options.find((option) => option.label === pasteValue)!
                    .value
              : pasteValue;
          if (row[col.key] !== value) {
            checkUpdatedRow = true;
            row[col.key] = value;
          }
        });

        if (checkUpdatedRow) {
          updateParameters.arguments.push({
            newRow: row,
            oldRow: rows[rowIndex + i],
          });
        }
      });

      if (updateParameters.arguments.length > 0) {
        return { ...state, updateParameters };
      } else {
        return state;
      }
    case "focus":
      return {
        ...state,
        isFocused: true,
        rowIndex: action.payload.rowIndex,
        colIndex: action.payload.colIndex,
      };
    case "unfocus":
      return { ...state, isFocused: false };
  }
};

export function usePasteReducer(initial: {
  rows: any[];
  cols: any[];
  colValidators: { [key: string]: (value: any) => boolean };
  onUpdateRowFunction?: (newRow: any, oldRow: any) => void;
}): TPasteReducerReturn {
  const [state, dispatch] = useReducer(reducer, {
    ...initial,
    isFocused: false,
    updateParameters: { arguments: [], timing: 0 },
  });
  const validators = useColumnValidatesContext();
  const focus = useFocusStateContext();

  useEffect(() => {
    if (focus.isFocus) {
      dispatch({
        type: "focus",
        payload: { rowIndex: focus.rowIndex, colIndex: focus.colIndex },
      });
    } else {
      dispatch({ type: "unfocus" });
    }
  }, [focus]);

  const setRows = useCallback((rows: any[]) => {
    dispatch({ type: "setRows", payload: { rows } });
  }, []);

  const setCols = useCallback((cols: any[]) => {
    dispatch({ type: "setCols", payload: { cols } });
  }, []);

  const setColValidators = useCallback(
    (colValidators: { [key: string]: (value: any) => boolean }) => {
      dispatch({ type: "setColValidators", payload: { colValidators } });
    },
    []
  );

  useEffect(() => {
    setColValidators(validators);
  }, [validators]);

  const setOnUpdateRowFunction = useCallback(
    (onUpdateRowFunction?: (newRow: any, oldRow: any) => void) => {
      dispatch({
        type: "setOnUpdateRowFunction",
        payload: { onUpdateRowFunction },
      });
    },
    []
  );

  const onPaste = useCallback((pasteData: string[][]) => {
    dispatch({ type: "onPaste", payload: { pasteData } });
  }, []);

  useEffect(() => {
    if (state.updateParameters.arguments.length > 0) {
      state.updateParameters.arguments.forEach(({ newRow, oldRow }) => {
        state.onUpdateRowFunction?.(newRow, oldRow);
      });
    }
  }, [state.updateParameters.timing, state.onUpdateRowFunction]);

  const actions: TPasteReducerReturn = useMemo(
    () => ({
      setRows,
      setCols,
      setColValidators,
      setOnUpdateRowFunction,
      onPaste,
    }),
    []
  );

  return actions;
}
