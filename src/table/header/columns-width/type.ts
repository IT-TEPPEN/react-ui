export type TColumnWidth = {
  key: string;
  colWidth: number;
  minWidth: number;
  index: number;
};

/** Widths the user changed by dragging, by column key. */
export type TColumnsWidthOverrides = { [key in string]: number };

export type TColumnsWidthAction = {
  type: "set";
  payload: {
    key: string;
    colWidth: number;
  };
};

export type TColumnsWidthReducer = React.Reducer<
  TColumnsWidthOverrides,
  TColumnsWidthAction
>;

export type TColumnsWidthStateContext = {
  columns: TColumnWidth[];
  getColumnWidth: (key: string) => number;
  getColumnMinWidth: (key: string) => number;
};
export type TColumnsWidthActionContext = {
  setColWidth: (key: string, colWidth: number) => void;
};

export type TColumnsWidthHook = (
  cols: { key: string; initialWidth?: number; minWidth?: number }[]
) => {
  state: TColumnsWidthStateContext;
  action: TColumnsWidthActionContext;
};
