import { useCallback, useMemo, useState } from "react";
import { useRangeStateContext } from "../range/provider";
import { selectionBounds } from "../range/bounds";
import { TReturnCopyReducer } from "./types";
import { useColumnsContext } from "../sheet/providers";
import { useShownRows } from "../shown-rows/provider";
import { formatDateForCopy, formatDatetimeForCopy } from "./format";

export function useCopyReducer(): TReturnCopyReducer {
  const [copiedAt, setCopiedAt] = useState<Date>();
  const range = useRangeStateContext();
  const cols = useColumnsContext();
  const shownRows = useShownRows();

  const copy = useCallback(
    (options?: { enableDeprecatedCopy?: boolean }) => {
      if (!range.isSelecting) {
        return;
      }

      const bounds = selectionBounds(range.start, range.end);

      const copiedData = shownRows.current
        .slice(bounds.start.rowIndex, bounds.end.rowIndex + 1)
        .map((row) => {
          const copiedRow: (string | number | Date)[] = [];
          for (let i = bounds.start.colIndex; i <= bounds.end.colIndex; i++) {
            const col = cols[i];

            if (col.type == "number" || col.type == "string") {
              copiedRow.push(row[col.key]);
              continue;
            } else if (col.type == "select") {
              const value = row[col.key];

              if (value === null || value === undefined || value === "") {
                copiedRow.push("");
              } else {
                // Fall back to the value itself when it is not an option.
                const option = col.options.find(
                  (option) => option.value === value
                );
                copiedRow.push(option ? option.label : String(value));
              }
              continue;
            } else if (col.type === "date") {
              copiedRow.push(formatDateForCopy(row[col.key]));
              continue;
            } else if (col.type === "datetime") {
              copiedRow.push(formatDatetimeForCopy(row[col.key]));
              continue;
            }

            col satisfies never;
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

      setCopiedAt(new Date());
    },
    [range, cols, shownRows]
  );

  const states = useMemo(() => ({ copiedAt }), [copiedAt]);
  const actions = useMemo(() => ({ copy }), [copy]);

  return {
    states,
    actions,
  };
}
