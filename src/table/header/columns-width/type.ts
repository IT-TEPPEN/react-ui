export type TColumnWidth = {
  key: string;
  colWidth: number;
  minWidth: number;
  index: number;
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
  cols: { key: string; initialWidth?: number; minWidth?: number }[],
  initialWidths?: TColumnsWidthOverrides
) => {
  state: TColumnsWidthStateContext;
  action: TColumnsWidthActionContext;
};
