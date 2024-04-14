import { useCallback, useReducer } from "react";
import { TReturnSortReducer, TSortReducer } from "./types";
import { DataObject } from "../type";

const reducer: TSortReducer = (state, action) => {
  switch (action.type) {
    case "changeKey":
      return { key: action.payload.key, asc: true };
    case "changeOrder":
      return { ...state, asc: !state.asc };
  }
};

export function useSortReducer(initial?: {
  key: string;
  asc?: boolean;
}): TReturnSortReducer {
  const [state, dispatch] = useReducer(reducer, {
    key: initial?.key ?? "id",
    asc: initial?.asc ?? true,
  });

  const changeKey = (key: string) => {
    dispatch({ type: "changeKey", payload: { key } });
  };

  const changeOrder = () => {
    dispatch({ type: "changeOrder" });
  };

  const sort = useCallback(
    <T extends DataObject>(rows: T[]) =>
      [...rows].sort((a, b) => {
        if (a[state.key] < b[state.key]) {
          return state.asc ? -1 : 1;
        }
        if (a[state.key] > b[state.key]) {
          return state.asc ? 1 : -1;
        }
        return 0;
      }),
    [state]
  );

  return { key: state.key, asc: state.asc, changeKey, changeOrder, sort };
}
