import { Reducer } from "react";
import { Condition } from "../../search-bar";
import { DataObject, DataRecord } from "../table/type";

export type TFilterState = {
  conditions: Condition[];
};

export type TFilterAction =
  | {
      type: "add";
      payload: {
        condition: Condition;
      };
    }
  | {
      type: "remove";
      payload: {
        index: number;
      };
    }
  | {
      type: "clear";
    };

export type TFilterReducer = Reducer<TFilterState, TFilterAction>;

export type TFilterStateContext = TFilterState;
export type TFilterActionContext = {
  addFilter: (condition: Condition) => void;
  removeFilter: (index: number) => void;
  clearFilter: () => void;
};
export type TFilterFunctionContext = {
  filter: <T extends DataRecord>(rows: DataObject<T>[]) => DataObject<T>[];
};

export type TFilterHook = (initialConditions: Condition[]) => {
  state: TFilterState;
  actions: TFilterActionContext;
  functions: TFilterFunctionContext;
};
