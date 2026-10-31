export type TColumnWidth = {
  key: string;
  colWidth: number;
  minWidth: number;
  index: number;
  /** For a pinned column: its distance from the left edge (px). */
  pinnedLeft?: number;
  /** The rightmost pinned column, which draws the edge line. */
  lastPinned?: boolean;
};

/** Widths the user changed by dragging, by column key. */
export type TColumnsWidthOverrides = { [key in string]: number };

export type TColumnsWidthAction =
  | {
      type: "set";
      payload: {
        key: string;
        colWidth: number;
      };
    }
  | { type: "commit" };

export type TColumnsWidthState = {
  /** Widths in use, updated while dragging. */
  overrides: TColumnsWidthOverrides;
  /** Widths as of the last finished drag; what the app is told about. */
  committed: TColumnsWidthOverrides;
};

export type TColumnsWidthReducer = React.Reducer<
  TColumnsWidthState,
  TColumnsWidthAction
>;

export type TColumnsWidthStateContext = {
  columns: TColumnWidth[];
  /** Whether the checkbox column (left of all columns) is pinned too. */
  checkboxPinned: boolean;
  /** Total width of the pinned columns, including the checkbox column. */
  pinnedWidth: number;
  /** The column with this key, with its pinning, if any. */
  getColumn: (key: string) => TColumnWidth | undefined;
  getColumnWidth: (key: string) => number;
  getColumnMinWidth: (key: string) => number;
  /** Widths the user set by dragging (finished drags only), by column key. */
  committedWidths: TColumnsWidthOverrides;
};
export type TColumnsWidthActionContext = {
  setColWidth: (key: string, colWidth: number) => void;
  /** Call when a drag ends, to report the widths. */
  commitWidths: () => void;
};

export type TColumnsWidthHook = (
  cols: {
    key: string;
    initialWidth?: number;
    minWidth?: number;
    pinned?: boolean;
  }[],
  initialWidths?: TColumnsWidthOverrides,
  /** Width of the checkbox column, or 0 without one. */
  checkboxWidth?: number
) => {
  state: TColumnsWidthStateContext;
  action: TColumnsWidthActionContext;
};
