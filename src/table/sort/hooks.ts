import { useCallback, useMemo, useReducer } from "react";
import { TReturnSortReducer, TSortKey, TSortReducer } from "./types";
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

const DEFAULT_SORT: TSortKey = { key: "id", asc: true };

export const sortReducer: TSortReducer = (state, action) => {
  switch (action.type) {
    case "click": {
      const { key } = action.payload;
      const only = state.sorts.length === 1 && state.sorts[0].key === key;

      if (only && state.isUpdatedData) {
        // The rows changed since the last sort: sort again, same order.
        return { ...state, isUpdatedData: false, sortTiming: state.sortTiming + 1 };
      }
      return {
        sorts: [{ key, asc: only ? !state.sorts[0].asc : true }],
        isUpdatedData: false,
        sortTiming: state.sortTiming + 1,
      };
    }
    case "shiftClick": {
      const { key } = action.payload;
      const index = state.sorts.findIndex((sort) => sort.key === key);

      // Not sorted by it yet: add it last. Ascending: make it descending, in
      // its place. Descending: remove it (the ones after it move up).
      const sorts =
        index === -1
          ? [...state.sorts, { key, asc: true }]
          : state.sorts[index].asc
          ? state.sorts.map((sort, i) => (i === index ? { key, asc: false } : sort))
          : state.sorts.filter((_, i) => i !== index);

      return { sorts, isUpdatedData: false, sortTiming: state.sortTiming + 1 };
    }
    case "updateData":
      return { ...state, isUpdatedData: true };
  }
};

/** Removes later conditions on a column that is already sorted by. */
function uniqueSorts(sorts: { key: string; asc?: boolean }[]): TSortKey[] {
  const seen = new Set<string>();
  const result: TSortKey[] = [];
  for (const sort of sorts) {
    if (seen.has(sort.key)) continue;
    seen.add(sort.key);
    result.push({ key: sort.key, asc: sort.asc ?? true });
  }
  return result;
}

export function useSortReducer<T extends DataRecord>(
  initial: { key: string; asc?: boolean }[] = []
): TReturnSortReducer<T> {
  const [state, dispatch] = useReducer(sortReducer, initial, (sorts) => ({
    sorts: uniqueSorts(sorts),
    isUpdatedData: false,
    sortTiming: 0,
  }));

  const sorts = state.sorts.length > 0 ? state.sorts : [DEFAULT_SORT];

  const sort = useCallback(
    <U extends DataRecord>(
      rows: DataObject<U>[],
      getValues: (((row: DataObject<U>) => unknown) | undefined)[] = []
    ) => {
      const conditions = sorts.map(({ key, asc }, i) => ({
        asc,
        getValue: getValues[i] ?? ((row: DataObject<U>) => row[key]),
      }));

      return [...rows].sort((rowA, rowB) => {
        for (const { asc, getValue } of conditions) {
          const a = getValue(rowA);
          const b = getValue(rowB);

          // Empty values stay at the end in both orders.
          if (isEmpty(a) && isEmpty(b)) continue;
          if (isEmpty(a)) return 1;
          if (isEmpty(b)) return -1;

          const result = compareValues(a, b);
          if (result !== 0) return asc ? result : -result;
        }
        // Equal in every condition: keep their order.
        return 0;
      });
    },
    [JSON.stringify(sorts)]
  );

  const publicState = useMemo(
    () => ({
      sorts: state.sorts,
      key: sorts[0].key as keyof T,
      asc: sorts[0].asc,
      isUpdatedData: state.isUpdatedData,
    }),
    [state.sorts, state.isUpdatedData]
  );

  const actions = useMemo(
    () => ({
      click: (key: string) => dispatch({ type: "click", payload: { key } }),
      shiftClick: (key: string) =>
        dispatch({ type: "shiftClick", payload: { key } }),
      updatedData: () => dispatch({ type: "updateData" }),
      sort,
    }),
    [sort]
  );

  return { state: publicState, actions, sortTiming: state.sortTiming };
}
