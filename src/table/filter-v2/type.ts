import { Reducer } from "react";
import { Condition } from "../../search-bar";
import { DataObject, DataRecord } from "../table/type";

/** How conditions are combined: all must match, or any one. */
export type TFilterMode = "and" | "or";

export type TFilterState = {
  conditions: Condition[];
  mode: TFilterMode;
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
    }
  | {
      type: "setMode";
      payload: { mode: TFilterMode };
    };

export type TFilterReducer = Reducer<TFilterState, TFilterAction>;

export type TFilterStateContext = TFilterState;
export type TFilterActionContext = {
  addFilter: (condition: Condition) => void;
  removeFilter: (index: number) => void;
  clearFilter: () => void;
  setMode: (mode: TFilterMode) => void;
};
export type TFilterFunctionContext = {
  /**
   * Filters rows by the conditions. `getKeywordText` gives the text of a row
   * that the all-columns keyword condition searches.
   */
  filter: <T extends DataRecord>(
    rows: DataObject<T>[],
    getKeywordText?: (row: DataObject<T>) => string,
    /** The value a condition on column `key` compares. Defaults to row[key]. */
    getValue?: (row: DataObject<T>, key: string) => unknown
  ) => DataObject<T>[];
};

export type TFilterHook = (
  initialConditions: Condition[],
  initialMode?: TFilterMode
) => {
  state: TFilterState;
  actions: TFilterActionContext;
  functions: TFilterFunctionContext;
};
