import { useCallback, useEffect, useMemo, useRef } from "react";
import { TPasteHookArguments, TPasteReducerReturn } from "./types";
import {
  useColumnsContext,
  useColumnValidatesContext,
} from "../sheet/providers";
import { useShownRows } from "../shown-rows/provider";
import { selectionBounds } from "../range/bounds";
import { useRangeActionContext, useRangeStateContext } from "../range/provider";
import { paste } from "./logic";
import { parseClipboardText } from "./parse";
import { isTextEntryTarget } from "../operation/event-target";
import { useMessages } from "../locale/provider";

export function usePasteReducer(
  args: TPasteHookArguments
): TPasteReducerReturn {
  const { setRange } = useRangeActionContext();
  const validators = useColumnValidatesContext();
  const range = useRangeStateContext();
  const messages = useMessages();
  const shownRows = useShownRows();
  const cols = useColumnsContext();

  // Read the latest props when a paste happens, so callbacks passed in later
  // renders are the ones that get called.
  const latest = useRef({ ...args, cols, validators, range, messages });
  useEffect(() => {
    latest.current = { ...args, cols, validators, range, messages };
  });

  const onPaste = useCallback(
    (pasteData: string[][]) => {
      const {
        cols,
        validators,
        range,
        messages,
        onUpdateRowFunction,
        onPasteError,
      } = latest.current;

      if (!range.isSelecting || !onUpdateRowFunction) {
        return;
      }

      const res = paste({
        pasteData,
        // Paste from the top-left cell of the selection.
        pasteArea: selectionBounds(range.start, range.end),
        currentRows: shownRows.current,
        currentCols: cols,
        validators,
        messages: messages.paste,
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
    [setRange, shownRows]
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

  return useMemo(() => ({ onPaste }), [onPaste]);
}
