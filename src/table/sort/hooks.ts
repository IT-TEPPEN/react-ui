import { useCallback, useMemo, useReducer } from "react";
import { TReturnSortReducer, TSortReducer } from "./types";
import { DataObject, DataRecord } from "../table/type";

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
    <U extends DataRecord>(rows: DataObject<U>[]) =>
      [...rows].sort((a, b) => {
        if (a[state.key] < b[state.key]) {
          return state.asc ? -1 : 1;
        }
        if (a[state.key] > b[state.key]) {
          return state.asc ? 1 : -1;
        }
        return 0;
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
