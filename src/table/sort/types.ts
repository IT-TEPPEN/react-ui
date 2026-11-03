import { Reducer } from "react";
import { DataObject, DataRecord } from "../table/type";

/** One sort condition: a column and its order. */
export type TSortKey = { key: string; asc: boolean };

type TSortState = {
  /** In order of priority. Empty: rows are in id order. */
  sorts: TSortKey[];
  isUpdatedData: boolean;
  sortTiming: number;
};

type TSortAction =
  | { type: "click"; payload: { key: string } }
  | { type: "shiftClick"; payload: { key: string } }
  | { type: "updateData" };

export type TSortReducer = Reducer<TSortState, TSortAction>;

export type TReturnSortReducer<T extends DataRecord> = {
  state: {
    sorts: TSortKey[];
    /** The first condition (id ascending when there is none). */
    key: keyof T;
    asc: boolean;
    isUpdatedData: boolean;
  };
  actions: {
    /** Sorts by this column only (toggles the order if it already is). */
    click: (key: string) => void;
    /** Adds this column to the conditions, or turns it desc, or removes it. */
    shiftClick: (key: string) => void;
    updatedData: () => void;
    /**
     * Sorts rows by the conditions. `getValues[i]` gives the value to compare
     * for the i-th condition (e.g. the label of a select option); by default
     * the row's value.
     */
    sort: <U extends DataRecord>(
      rows: DataObject<U>[],
      getValues?: (((row: DataObject<U>) => unknown) | undefined)[]
    ) => DataObject<U>[];
  };
  sortTiming: number;
};
