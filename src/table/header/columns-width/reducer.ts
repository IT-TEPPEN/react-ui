import { useEffect, useMemo, useReducer } from "react";
import { TColumnWidth, TColumnsWidthHook, TColumnsWidthReducer } from "./type";
import { DEFAULT_COL_WIDTH, DEFAULT_MIN_COL_WIDTH } from "../../constant";

export const columnsWidthReducer: TColumnsWidthReducer = (state, action) => {
  switch (action.type) {
    case "set":
      if (state.overrides[action.payload.key] === action.payload.colWidth) {
        return state;
      }
      return {
        ...state,
        overrides: {
          ...state.overrides,
          [action.payload.key]: action.payload.colWidth,
        },
      };
    case "commit":
      if (state.committed === state.overrides) return state;
      return { ...state, committed: state.overrides };
    default:
      return state;
  }
};

export const useColumnsWidthReducer: TColumnsWidthHook = (
  cols,
  initialWidths = {},
  checkboxWidth = 0
) => {
  const [{ overrides, committed }, dispatch] = useReducer(
    columnsWidthReducer,
    initialWidths,
    (widths) => ({ overrides: widths, committed: widths })
  );

  // Widths are derived from the current columns on every change, so added,
  // removed or reordered columns always have a width. Widths the user set by
  // dragging are kept for columns that still exist.
  const columns = useMemo(() => {
    const result: TColumnWidth[] = cols.map((col, index) => {
      const minWidth = col.minWidth || DEFAULT_MIN_COL_WIDTH;
      const colWidth =
        overrides[col.key] ?? (col.initialWidth || DEFAULT_COL_WIDTH);

      return {
        key: col.key,
        colWidth: Math.max(colWidth, minWidth),
        minWidth,
        index,
      };
    });

    // Columns are pinned from the left: the leading run of pinned columns.
    let left = checkboxWidth;
    for (const column of result) {
      if (!cols[column.index].pinned) break;
      column.pinnedLeft = left;
      left += column.colWidth;
    }
    const pinnedColumns = result.filter((c) => c.pinnedLeft !== undefined);
    if (pinnedColumns.length > 0) {
      pinnedColumns[pinnedColumns.length - 1].lastPinned = true;
    }

    return result;
  }, [cols, overrides, checkboxWidth]);

  // A pinned column after an unpinned one cannot stay at the left edge.
  const ignoredPinnedKey = cols
    .filter((col, i) => col.pinned && columns[i]?.pinnedLeft === undefined)
    .map((col) => col.key)
    .join(",");
  useEffect(() => {
    if (ignoredPinnedKey !== "") {
      console.warn(
        `Ignored pinned on column(s) ${ignoredPinnedKey}: only columns from the left edge can be pinned`
      );
    }
  }, [ignoredPinnedKey]);

  const state = useMemo(() => {
    const byKey = new Map(columns.map((column) => [column.key, column]));

    const pinned = columns.filter((c) => c.pinnedLeft !== undefined);
    const last = pinned[pinned.length - 1];

    return {
      columns,
      checkboxPinned: pinned.length > 0 && checkboxWidth > 0,
      pinnedWidth: last ? (last.pinnedLeft ?? 0) + last.colWidth : 0,
      getColumn: (key: string) => byKey.get(key),
      committedWidths: committed,
      getColumnWidth: (key: string) => {
        const column = byKey.get(key);

        if (!column) {
          console.warn(`Column width state not found: ${key}`);
          return DEFAULT_COL_WIDTH;
        }

        return column.colWidth;
      },
      getColumnMinWidth: (key: string) => {
        const column = byKey.get(key);

        if (!column) {
          console.warn(`Column width state not found: ${key}`);
          return DEFAULT_MIN_COL_WIDTH;
        }

        return column.minWidth;
      },
    };
  }, [columns, committed, checkboxWidth]);

  const action = useMemo(
    () => ({
      setColWidth: (key: string, colWidth: number) => {
        dispatch({ type: "set", payload: { key, colWidth } });
      },
      commitWidths: () => {
        dispatch({ type: "commit" });
      },
    }),
    []
  );

  return { state, action };
};
