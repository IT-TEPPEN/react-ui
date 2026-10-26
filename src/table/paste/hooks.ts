import { useCallback, useEffect, useMemo, useRef } from "react";
import { TPasteHookArguments, TPasteReducerReturn } from "./types";
import { useColumnValidatesContext } from "../sheet/providers";
import { useRangeActionContext, useRangeStateContext } from "../range/provider";
import { paste } from "./logic";
import { parseClipboardText } from "./parse";
import { isTextEntryTarget } from "../operation/event-target";

export function usePasteReducer(args: TPasteHookArguments): TPasteReducerReturn {
  const { setRange } = useRangeActionContext();
  const validators = useColumnValidatesContext();
  const range = useRangeStateContext();
  const rowsRef = useRef(args.rows);

  // Read the latest props when a paste happens, so callbacks passed in later
  // renders are the ones that get called.
  const latest = useRef({ ...args, validators, range });
  useEffect(() => {
    latest.current = { ...args, validators, range };
  });

  const setRows = useCallback((rows: any[]) => {
    rowsRef.current = rows;
  }, []);

  const onPaste = useCallback(
    (pasteData: string[][]) => {
      const { cols, validators, range, onUpdateRowFunction, onPasteError } =
        latest.current;

      if (!range.isSelecting || !onUpdateRowFunction) {
        return;
      }

      const res = paste({
        pasteData,
        // The selection may have been made bottom-up or right-to-left, so
        // paste from its top-left cell.
        pasteArea: {
          start: {
            rowIndex: Math.min(range.start.rowIndex, range.end.rowIndex),
            colIndex: Math.min(range.start.colIndex, range.end.colIndex),
          },
          end: {
            rowIndex: Math.max(range.start.rowIndex, range.end.rowIndex),
            colIndex: Math.max(range.start.colIndex, range.end.colIndex),
          },
        },
        currentRows: rowsRef.current,
        currentCols: cols,
        validators,
      });

      if (res.isError) {
        // Validation errors are already reported by the column validators.
        if (res.type === "ValidationError" || res.type === "NoPasteData") {
          return;
        }

        const error = { type: res.type, message: res.message };
        if (onPasteError) {
          onPasteError(error);
        } else {
          alert(error.message);
        }
        return;
      }

      res.updateArgument.forEach(({ newRow, oldRow }) => {
        onUpdateRowFunction(newRow, oldRow);
      });
      setRange(res.pasteRange);
    },
    [setRange]
  );

  useEffect(() => {
    const listener = (e: ClipboardEvent) => {
      const { range, onUpdateRowFunction } = latest.current;

      if (!range.isSelecting || !onUpdateRowFunction) {
        return;
      }

      // Leave pastes into text fields (including the cell editor) to them.
      if (isTextEntryTarget(e.target)) {
        return;
      }

      if (e.clipboardData) {
        e.preventDefault();
        onPaste(parseClipboardText(e.clipboardData.getData("Text")));
      }
    };

    document.addEventListener("paste", listener);

    return () => {
      document.removeEventListener("paste", listener);
    };
  }, [onPaste]);

  return useMemo(() => ({ setRows, onPaste }), [setRows, onPaste]);
}
