import { Reducer } from "react";
import { DataObject, DataRecord } from "../type";

type TSortState = {
  key: string;
  asc: boolean;
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
    };

export type TSortReducer = Reducer<TSortState, TSortAction>;

export type TReturnSortReducer<T extends DataRecord> = {
  key: keyof T;
  asc: boolean;
  changeKey: (key: string) => void;
  changeOrder: () => void;
  sort: <U extends DataRecord>(rows: DataObject<U>[]) => DataObject<U>[];
};
