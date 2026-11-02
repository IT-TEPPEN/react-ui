import { useCallback, useEffect, useMemo, useRef } from "react";
import { TPasteHookArguments, TPasteReducerReturn } from "./types";
import {
  useColumnsContext,
  useColumnValidatesContext,
} from "../sheet/providers";
import { useShownRows } from "../shown-rows/provider";
import { selectionBounds } from "../range/bounds";
import { useRangeActionContext } from "../range/provider";
import { paste } from "./logic";
import { emptyCells, fillDown as fillDownRows, TRowUpdate } from "./bulk";
import { parseClipboardText } from "./parse";
import { isTextEntryTarget } from "../operation/event-target";
import { useMessages } from "../locale/provider";

export function usePasteReducer(
  args: TPasteHookArguments
): TPasteReducerReturn {
  const { setRange, getSelection } = useRangeActionContext();
  const validators = useColumnValidatesContext();
  const messages = useMessages();
  const shownRows = useShownRows();
  const cols = useColumnsContext();

  // Read the latest props when a paste happens, so callbacks passed in later
  // renders are the ones that get called.
  const latest = useRef({ ...args, cols, validators, messages });
  useEffect(() => {
    latest.current = { ...args, cols, validators, messages };
  });

  const onPaste = useCallback(
    (pasteData: string[][]) => {
      const { cols, validators, messages, onUpdateRowFunction, onPasteError } =
        latest.current;
      const selection = getSelection();

      if (!selection || !onUpdateRowFunction) {
        return;
      }

      const res = paste({
        pasteData,
        // Paste from the top-left cell of the selection.
        pasteArea: selectionBounds(selection.start, selection.end),
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
    [setRange, shownRows, getSelection]
  );

  // Delete on a selection and Ctrl+D: changes several cells at once and
  // passes each changed row to onUpdateRow, as a paste does.
  const changeSelection = useCallback(
    (
      change: typeof emptyCells,
      canRun: (area: ReturnType<typeof selectionBounds>) => boolean
    ) => {
      const { cols, onUpdateRowFunction } = latest.current;
      const selection = getSelection();
      if (!selection || !onUpdateRowFunction) return false;

      const area = selectionBounds(selection.start, selection.end);
      if (!canRun(area)) return false;

      const updates: TRowUpdate[] = change(shownRows.current, cols, area);
      updates.forEach(({ newRow, oldRow }) => onUpdateRowFunction(newRow, oldRow));
      return true;
    },
    [shownRows, getSelection]
  );

  const emptySelection = useCallback(
    () => changeSelection(emptyCells, () => true),
    [changeSelection]
  );

  const fillDown = useCallback(
    () =>
      changeSelection(
        fillDownRows,
        (area) => area.end.rowIndex > area.start.rowIndex
      ),
    [changeSelection]
  );

  useEffect(() => {
    const listener = (e: ClipboardEvent) => {
      const { onUpdateRowFunction } = latest.current;

      if (!getSelection() || !onUpdateRowFunction) {
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

  return useMemo(
    () => ({ onPaste, emptySelection, fillDown }),
    [onPaste, emptySelection, fillDown]
  );
}
