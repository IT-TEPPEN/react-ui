import { useCallback, useMemo, useReducer } from "react";
import { TReturnSortReducer, TSortReducer } from "./types";
import { DataObject, DataRecord } from "../table/type";
import { compareText } from "../../share/text/normalize";

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "number" && isNaN(value)) ||
    (value instanceof Date && isNaN(value.getTime()))
  );
}

/** Numbers and dates by value; text in Japanese order ("2" before "10"). */
function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  return compareText(String(a), String(b));
}

const reducer: TSortReducer = (state, action) => {
  switch (action.type) {
    case "changeKey":
      return {
        key: action.payload.key,
        asc: true,
        isUpdatedData: false,
        sortTiming: state.sortTiming + 1,
      };
    case "changeOrder":
      if (state.isUpdatedData) {
        return {
          ...state,
          isUpdatedData: false,
          sortTiming: state.sortTiming + 1,
        };
      } else {
        return { ...state, asc: !state.asc, sortTiming: state.sortTiming + 1 };
      }
    case "updateData":
      return { ...state, isUpdatedData: true };
  }
};

export function useSortReducer<T extends DataRecord>(initial?: {
  key: string;
  asc?: boolean;
}): TReturnSortReducer<T> {
  const [state, dispatch] = useReducer(reducer, {
    key: initial?.key ?? "id",
    asc: initial?.asc ?? true,
    isUpdatedData: false,
    sortTiming: 0,
  });

  const changeKey = (key: string) => {
    dispatch({ type: "changeKey", payload: { key } });
  };

  const changeOrder = () => {
    dispatch({ type: "changeOrder" });
  };

  const updatedData = () => {
    dispatch({ type: "updateData" });
  };

  const sort = useCallback(
    <U extends DataRecord>(
      rows: DataObject<U>[],
      getValue: (row: DataObject<U>) => unknown = (row) => row[state.key]
    ) =>
      [...rows].sort((rowA, rowB) => {
        const a = getValue(rowA);
        const b = getValue(rowB);

        // Empty values stay at the end in both orders.
        if (isEmpty(a) && isEmpty(b)) return 0;
        if (isEmpty(a)) return 1;
        if (isEmpty(b)) return -1;

        const result = compareValues(a, b);
        return state.asc ? result : -result;
      }),
    [state.key, state.asc]
  );

  const stateExcludeSortTiming = useMemo(
    () => ({
      key: state.key,
      asc: state.asc,
      isUpdatedData: state.isUpdatedData,
    }),
    [state.key, state.asc, state.isUpdatedData]
  );

  const actions = useMemo(
    () => ({ changeKey, changeOrder, updatedData, sort }),
    [sort]
  );

  return {
    state: stateExcludeSortTiming,
    actions,
    sortTiming: state.sortTiming,
  };
}
