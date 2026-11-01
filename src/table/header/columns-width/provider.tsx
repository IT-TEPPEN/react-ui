"use client";

import { useMemo } from "react";
import { DataRecord, TTableColumn } from "../../table/type";
import {
  ColumnsWidthActionContext,
  ColumnsWidthStateContext,
  useColumnsWidthState,
} from "./context";
import { useColumnsWidthReducer } from "./reducer";

export function ColumnsWidthProvider(props: {
  children: React.ReactNode;
  cols: TTableColumn<DataRecord>[];
  /** Widths to start with, e.g. restored from a saved condition. */
  initialWidths?: { [key: string]: number };
  /** Whether rows have a checkbox column (pinned with pinned columns). */
  checkbox?: boolean;
}) {
  const cols = useMemo(
    () =>
      props.cols.map((col) => ({
        key: col.key.toString(),
        initialWidth: col.initialWidth,
        minWidth: col.minWidth,
        pinned: col.pinned,
      })),
    [props.cols]
  );
  const { state, action } = useColumnsWidthReducer(
    cols,
    props.initialWidths,
    props.checkbox ? CHECKBOX_COLUMN_WIDTH : 0
  );

  return (
    <ColumnsWidthStateContext.Provider value={state}>
      <ColumnsWidthActionContext.Provider value={action}>
        {props.children}
      </ColumnsWidthActionContext.Provider>
    </ColumnsWidthStateContext.Provider>
  );
}

// Escapes a value for use inside a double-quoted CSS attribute selector.
function escapeCssString(value: string) {
  return value.replace(/["\\]/g, "\\$&").replace(/\n/g, "\\a ");
}

/**
 * Applies the column widths to the body cells (`.table-col-N`) of one table.
 * The rules are scoped to the element with `scopeId`, so several tables on
 * the same page do not affect each other, and cells rendered later (e.g.
 * after changing pages) get their width automatically.
 */
export function ColumnsWidthStyle(props: { scopeId: string }) {
  const { columns, checkboxPinned, pinnedWidth } = useColumnsWidthState();
  const scope = `[id="${escapeCssString(props.scopeId)}"]`;

  const rules = columns.map(({ index, colWidth, pinnedLeft, lastPinned }) => {
    const width = `width:${colWidth}px;min-width:${colWidth}px;max-width:${colWidth}px;`;
    const pinned =
      pinnedLeft === undefined
        ? ""
        : `position:sticky;left:${pinnedLeft}px;${PINNED_CELL}${
            lastPinned ? PINNED_EDGE : ""
          }`;
    return `${scope} .table-col-${index}{${width}${pinned}}`;
  });

  // The checkbox column keeps its width like the other columns (without
  // min/max-width a wide table squeezed it), and is pinned with them.
  const checkboxWidth = `width:${CHECKBOX_COLUMN_WIDTH}px;min-width:${CHECKBOX_COLUMN_WIDTH}px;max-width:${CHECKBOX_COLUMN_WIDTH}px;`;
  rules.push(
    `${scope} .table-col-checkbox{${checkboxWidth}${
      checkboxPinned ? `position:sticky;left:0;${PINNED_CELL}` : ""
    }}`
  );
  if (pinnedWidth > 0) {
    // Keyboard moves scroll a cell into view clear of the pinned columns.
    rules.push(`${scope}{scroll-padding-left:${pinnedWidth}px;}`);
  }

  return <style>{rules.join("\n")}</style>;
}

/** Width of the checkbox column (w-8). */
export const CHECKBOX_COLUMN_WIDTH = 32;

// Pinned cells cover the cells scrolling under them.
const PINNED_CELL =
  "z-index:1;background-color:var(--teppen-table-bg,#ffffff);";
// A line on the right edge of the last pinned column.
const PINNED_EDGE =
  "box-shadow:inset -1px 0 0 var(--teppen-table-pinned-border,#cbd5e1);";
