import { Reducer } from "react";
import { DataObject, DataRecord } from "../type";

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
    sort: <U extends DataRecord>(rows: DataObject<U>[]) => DataObject<U>[];
  };
  sortTiming: number;
};
