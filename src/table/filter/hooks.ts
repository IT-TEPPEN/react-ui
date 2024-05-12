import { useCallback, useReducer } from "react";
import {
  TFilter,
  TFilterAction,
  TFilterState,
  TReturnUseFilterReducer,
} from "./types";
import { DataObject, DataRecord } from "../type";

function reducer<T extends DataRecord>(
  state: TFilterState<T>,
  action: TFilterAction<T>
): TFilterState<T> {
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
}

export function useFilterReducer<
  T extends DataRecord
>(): TReturnUseFilterReducer<T> {
  const [state, dispatch] = useReducer(reducer, { filters: [] });

  const addFilter = useCallback(
    (filter: TFilter<T>) => dispatch({ type: "add", payload: { filter } }),
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
    <U extends DataRecord>(rows: DataObject<U>[]): DataObject<U>[] => {
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
            return acc.filter(
              (row) => (row[filter.key] as number) > filter.value
            );
          case "lt":
            return acc.filter(
              (row) => (row[filter.key] as number) < filter.value
            );
          case "gte":
            return acc.filter(
              (row) => (row[filter.key] as number) >= filter.value
            );
          case "lte":
            return acc.filter(
              (row) => (row[filter.key] as number) <= filter.value
            );
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
