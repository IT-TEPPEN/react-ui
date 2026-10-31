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
}) {
  const cols = useMemo(
    () =>
      props.cols.map((col) => ({
        key: col.key.toString(),
        initialWidth: col.initialWidth,
        minWidth: col.minWidth,
      })),
    [props.cols]
  );
  const { state, action } = useColumnsWidthReducer(cols, props.initialWidths);

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
  const { columns } = useColumnsWidthState();
  const scope = `[id="${escapeCssString(props.scopeId)}"]`;

  const css = columns
    .map(
      ({ index, colWidth }) =>
        `${scope} .table-col-${index}{width:${colWidth}px;min-width:${colWidth}px;max-width:${colWidth}px;}`
    )
    .join("\n");

  return <style>{css}</style>;
}
