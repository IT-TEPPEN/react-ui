import { useMemo, useRef } from "react";
import { DataRecord, TTableColumn } from "./type";

/**
 * Column functions that only run on an event or while sorting / filtering.
 * They do not change what a cell shows, so a new function with the same
 * name does not need the cells to be drawn again.
 */
const CALLBACK_KEYS = ["onCellBlur", "sortValue", "filterValue"] as const;

const functionIds = new WeakMap<Function, number>();
let nextFunctionId = 0;

function functionId(fn: Function) {
  let id = functionIds.get(fn);
  if (id === undefined) {
    id = nextFunctionId++;
    functionIds.set(fn, id);
  }
  return id;
}

/**
 * What the columns look like: everything but the callbacks above. Other
 * functions, such as render, are told apart by identity, because a new one
 * may show something else.
 */
function columnsSignature<T extends DataRecord>(cols: TTableColumn<T>[]) {
  return JSON.stringify(
    cols.map((col) =>
      Object.fromEntries(
        Object.entries(col).map(([key, value]) => {
          if (typeof value !== "function") return [key, value];
          return (CALLBACK_KEYS as readonly string[]).includes(key)
            ? [key, "callback"]
            : [key, `function:${functionId(value)}`];
        })
      )
    )
  );
}

/**
 * Returns the same columns array while the columns look the same, so cols
 * defined inline (a new array and new callbacks on every render) do not
 * redraw every cell. Callbacks call the latest ones passed in.
 */
export function useStableColumns<T extends DataRecord>(
  cols: TTableColumn<T>[]
): TTableColumn<T>[] {
  const latest = useRef(cols);
  latest.current = cols;

  const signature = columnsSignature(cols);

  return useMemo(
    () =>
      cols.map((col, index) => {
        // Columns differ by type in which callbacks they have, so they are
        // read here as plain records.
        const stable: Record<string, unknown> = { ...col };
        for (const key of CALLBACK_KEYS) {
          if (typeof stable[key] === "function") {
            stable[key] = (...args: unknown[]) => {
              const current = latest.current[index] as Record<string, unknown>;
              return (current[key] as (...a: unknown[]) => unknown)(...args);
            };
          }
        }
        return stable as TTableColumn<T>;
      }),
    [signature]
  );
}

/**
 * A callback that keeps its identity while calling the latest one passed in.
 * Stays undefined when none is passed, so "is there a callback" still shows.
 */
export function useStableCallback<A extends unknown[], R>(
  callback: ((...args: A) => R) | undefined
): ((...args: A) => R) | undefined {
  const latest = useRef(callback);
  latest.current = callback;

  const stable = useMemo(
    () =>
      (...args: A) =>
        (latest.current as (...args: A) => R)(...args),
    []
  );
  return callback ? stable : undefined;
}
