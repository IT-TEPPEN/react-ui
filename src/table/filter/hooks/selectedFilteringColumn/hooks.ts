import { useMemo, useReducer } from "react";
import { TFilteringColumnReducer, TReturnFilteringColumnReducer } from "./type";
import { DataRecord, TTableColumn } from "../../../table/type";

const filteringColumnReducer: TFilteringColumnReducer = (state, action) => {
  switch (action.type) {
    case "set":
      if (!!state && state.key === action.payload.col.key) return state;

      if (
        action.payload.col.type === "string" ||
        action.payload.col.type === "number"
      ) {
        return {
          key: action.payload.col.key,
          type: action.payload.col.type,
          label: action.payload.col.label,
        };
      } else {
        return {
          key: action.payload.col.key,
          type: action.payload.col.type,
          label: action.payload.col.label,
          options: action.payload.col.options,
        };
      }
    case "clear":
      return null;
  }
};

export function useFilteringColumnReducer(): TReturnFilteringColumnReducer {
  const [state, dispatch] = useReducer(filteringColumnReducer, null);

  const actions = useMemo(
    () => ({
      setFilteringColumn: (col: TTableColumn<DataRecord>) =>
        dispatch({ type: "set", payload: { col } }),
      clearFilteringColumn: () => dispatch({ type: "clear" }),
    }),
    []
  );

  return { state, actions };
}
