import { useCallback, useEffect, useMemo, useReducer } from "react";
import { TPasteReducer, TPasteReducerReturn } from "./types";
import { useColumnValidatesContext } from "../sheet/providers";
import { useRangeActionContext, useRangeStateContext } from "../range/provider";
import { paste } from "./logic";

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
      const { rows, cols, colValidators, start, end, onUpdateRowFunction } =
        state;

      if (!onUpdateRowFunction) {
        return state;
      }

      const res = paste({
        pasteData,
        pasteArea: { start, end },
        currentRows: rows,
        currentCols: cols,
        validators: colValidators,
        tableArea: {
          start: {
            rowIndex: 0,
            colIndex: 0,
          },
          end: {
            rowIndex: rows.length - 1,
            colIndex: cols.length - 1,
          },
        },
      });

      if (res.isError) {
        if (res.type !== "ValidationError" && res.type !== "NoPasteData") {
          alert(res.message);
        }
        return state;
      }

      return {
        ...state,
        updateParameters: {
          arguments: res.updateArgument,
          pastedRange: res.pasteRange,
          timing: state.updateParameters.timing + 1,
        },
      };
    case "focus":
      return {
        ...state,
        isFocused: true,
        start: action.payload.start,
        end: action.payload.end,
      };
    case "unfocus":
      return { ...state, isFocused: false };
  }
};

export function usePasteReducer(initial: {
  rows: any[];
  cols: any[];
  onUpdateRowFunction?: (newRow: any, oldRow: any) => void;
}): TPasteReducerReturn {
  const { setRange } = useRangeActionContext();
  const [state, dispatch] = useReducer(reducer, {
    ...initial,
    colValidators: {},
    isFocused: false,
    updateParameters: { arguments: [], timing: 0 },
  });
  const validators = useColumnValidatesContext();
  const range = useRangeStateContext();

  useEffect(() => {
    dispatch({ type: "setCols", payload: { cols: initial.cols } });
  }, [initial.cols]);

  useEffect(() => {
    if (range.isSelecting) {
      dispatch({
        type: "focus",
        payload: {
          start: range.start,
          end: range.end,
        },
      });
    } else {
      dispatch({ type: "unfocus" });
    }
  }, [range]);

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

    if (state.updateParameters.pastedRange) {
      setRange(state.updateParameters.pastedRange);
    }
  }, [state.updateParameters.timing, state.onUpdateRowFunction]);

  useEffect(() => {
    const paste = (e: ClipboardEvent) => {
      if (!range.isSelecting) {
        return;
      }

      if (e.clipboardData) {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("Text");

        onPaste(
          pastedData
            .replace(/\t/g, ",")
            .trim()
            .replace(/\r\n/g, "\n")
            .split("\n")
            .map((row) => row.split(","))
        );
      }
    };

    document.addEventListener("paste", paste);

    return () => {
      document.removeEventListener("paste", paste);
    };
  }, [range.isSelecting]);

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
