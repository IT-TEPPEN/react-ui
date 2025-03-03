type TColumnsWidthState = {
  [key in string]: {
    colWidth: number;
    minWidth: number;
  };
};

type TColumnsWidthAction =
  | {
      type: "init";
      payload: {
        columnsWidth: TColumnsWidthState;
      };
    }
  | {
      type: "setMinWidth";
      payload: {
        key: string;
        minWidth: number;
      };
    }
  | {
      type: "set";
      payload: {
        key: string;
        colWidth: number;
      };
    };

export type TColumnsWidthReducer = React.Reducer<
  TColumnsWidthState,
  TColumnsWidthAction
>;

export type TColumnsWidthStateContext = {
  getColumnWidth: (key: string) => number;
  getColumnMinWidth: (key: string) => number;
};
export type TColumnsWidthActionContext = {
  setColWidth: (key: string, colWidth: number) => void;
};

export type TColumnsWidthHook = (initialState: TColumnsWidthState) => {
  state: TColumnsWidthStateContext;
  action: TColumnsWidthActionContext;
};
