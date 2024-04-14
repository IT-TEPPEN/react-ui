import { useCallback, useReducer } from "react";
import { TFilter, TFilterReducer, TReturnUseFilterReducer } from "./types";
import { DataObject } from "../type";

const reducer: TFilterReducer = (state, action) => {
  switch (action.type) {
    case "add":
      return {
        filters: [
          ...state.filters,
          { id: new Date().getTime(), ...action.payload.filter },
        ],
      };
    case "remove":
      return {
        filters: state.filters.filter((f) => f.id !== action.payload.id),
      };
    case "clear":
      return { filters: [] };
  }
};

export function useFilterReducer(): TReturnUseFilterReducer {
  const [state, dispatch] = useReducer(reducer, { filters: [] });

  const addFilter = useCallback(
    (filter: TFilter) => dispatch({ type: "add", payload: { filter } }),
    [dispatch]
  );
  const removeFilter = useCallback(
    (id: number) => dispatch({ type: "remove", payload: { id } }),
    [dispatch]
  );
  const clearFilter = useCallback(
    () => dispatch({ type: "clear" }),
    [dispatch]
  );

  const filter = useCallback(
    <T extends DataObject>(rows: T[]): T[] => {
      return state.filters.reduce((acc, filter) => {
        switch (filter.operator) {
          case "includeText":
            return acc.filter((row) => {
              const value = row[filter.key];
              if (typeof value === "string") {
                return filter.value.some((v) => value.includes(v));
              }
              return false;
            });
          case "eq":
            return acc.filter((row) => row[filter.key] === filter.value);
          case "ne":
            return acc.filter((row) => row[filter.key] !== filter.value);
          case "gt":
            return acc.filter((row) => row[filter.key] > filter.value);
          case "lt":
            return acc.filter((row) => row[filter.key] < filter.value);
          case "gte":
            return acc.filter((row) => row[filter.key] >= filter.value);
          case "lte":
            return acc.filter((row) => row[filter.key] <= filter.value);
          case "selected":
            return acc.filter((row) => row[filter.key] === filter.value);
          case "notSelected":
            return acc.filter((row) => row[filter.key] !== filter.value);
        }
      }, rows);
    },
    [state]
  );

  return {
    addFilter,
    removeFilter,
    clearFilter,
    filter,
    filterConditions: state.filters,
  };
}
