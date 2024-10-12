import { DataRecord, TTableColumn } from "../../../table/type";

export type TFilteringColumnState =
  | {
      key: TTableColumn<DataRecord>["key"];
      type: "string" | "number";
      label?: string;
    }
  | {
      key: TTableColumn<DataRecord>["key"];
      type: "select";
      options: { value: string; label: string }[];
      label?: string;
    }
  | null;

export type TFilteringColumnAction =
  | {
      type: "set";
      payload: {
        col: TTableColumn<DataRecord>;
      };
    }
  | {
      type: "clear";
    };

export type TFilteringColumnReducer = (
  state: TFilteringColumnState,
  action: TFilteringColumnAction
) => TFilteringColumnState;

export type TFilteringColumnStateContext = TFilteringColumnState;
export type TFilteringColumnActionContext = {
  setFilteringColumn: (col: TTableColumn<DataRecord>) => void;
  clearFilteringColumn: () => void;
};

export type TReturnFilteringColumnReducer = {
  state: TFilteringColumnStateContext;
  actions: TFilteringColumnActionContext;
};
