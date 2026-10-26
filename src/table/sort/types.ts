import { Reducer } from "react";
import { DataObject, DataRecord } from "../table/type";

type TSortState = {
  key: string;
  asc: boolean;
  isUpdatedData: boolean;
  sortTiming: number;
};

type TSortAction =
  | {
      type: "changeKey";
      payload: {
        key: string;
      };
    }
  | {
      type: "changeOrder";
    }
  | {
      type: "updateData";
    };

export type TSortReducer = Reducer<TSortState, TSortAction>;

export type TReturnSortReducer<T extends DataRecord> = {
  state: {
    key: keyof T;
    asc: boolean;
    isUpdatedData: boolean;
  };
  actions: {
    changeKey: (key: string) => void;
    changeOrder: () => void;
    updatedData: () => void;
    /**
     * Sorts rows by the current key. `getValue` gives the value to compare
     * (e.g. the label of a select option); defaults to the row's value.
     */
    sort: <U extends DataRecord>(
      rows: DataObject<U>[],
      getValue?: (row: DataObject<U>) => unknown
    ) => DataObject<U>[];
  };
  sortTiming: number;
};
