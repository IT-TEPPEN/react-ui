import { useMemo, useReducer } from "react";
import { TColumnsWidthHook, TColumnsWidthReducer } from "./type";
import { DEFAULT_COL_WIDTH, DEFAULT_MIN_COL_WIDTH } from "../../constant";

export const columnsWidthReducer: TColumnsWidthReducer = (state, action) => {
  switch (action.type) {
    case "set":
      if (state[action.payload.key] === action.payload.colWidth) {
        return state;
      }
      return { ...state, [action.payload.key]: action.payload.colWidth };
    default:
      return state;
  }
};

export const useColumnsWidthReducer: TColumnsWidthHook = (cols) => {
  const [overrides, dispatch] = useReducer(columnsWidthReducer, {});

  // Widths are derived from the current columns on every change, so added,
  // removed or reordered columns always have a width. Widths the user set by
  // dragging are kept for columns that still exist.
  const columns = useMemo(
    () =>
      cols.map((col, index) => {
        const minWidth = col.minWidth || DEFAULT_MIN_COL_WIDTH;
        const colWidth =
          overrides[col.key] ?? (col.initialWidth || DEFAULT_COL_WIDTH);

        return {
          key: col.key,
          colWidth: Math.max(colWidth, minWidth),
          minWidth,
          index,
        };
      }),
    [cols, overrides]
  );

  const state = useMemo(() => {
    const byKey = new Map(columns.map((column) => [column.key, column]));

    return {
      columns,
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
  }, [columns]);

  const action = useMemo(
    () => ({
      setColWidth: (key: string, colWidth: number) => {
        dispatch({ type: "set", payload: { key, colWidth } });
      },
    }),
    []
  );

  return { state, action };
};
