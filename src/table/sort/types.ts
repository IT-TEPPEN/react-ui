import { Reducer } from "react";
import { DataObject } from "../type";

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

export type TReturnSortReducer = {
  key: string;
  asc: boolean;
  changeKey: (key: string) => void;
  changeOrder: () => void;
  sort: <T extends DataObject>(rows: T[]) => T[];
};
