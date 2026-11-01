import { createContext, useContext, useMemo, useState } from "react";
import { DataRecord, TTableColumn } from "../table/type";

type TColumnVisibilityContext = {
  /** Keys of the hidden columns, as the user set them. */
  hiddenKeys: string[];
  setHidden: (key: string, hidden: boolean) => void;
  showAll: () => void;
};

const ColumnVisibilityContext = createContext<TColumnVisibilityContext>({
  hiddenKeys: [],
  setHidden: () => {},
  showAll: () => {},
});

export function useColumnVisibility() {
  return useContext(ColumnVisibilityContext);
}

/** Holds which columns the user has hidden. */
export function useColumnVisibilityState(initialHidden?: string[]) {
  const [hiddenKeys, setHiddenKeys] = useState<string[]>(() =>
    Array.from(new Set(initialHidden ?? []))
  );

  const value = useMemo<TColumnVisibilityContext>(
    () => ({
      hiddenKeys,
      setHidden: (key, hidden) =>
        setHiddenKeys((current) => {
          if (hidden === current.includes(key)) return current;
          return hidden
            ? [...current, key]
            : current.filter((hiddenKey) => hiddenKey !== key);
        }),
      showAll: () =>
        setHiddenKeys((current) => (current.length === 0 ? current : [])),
    }),
    [hiddenKeys]
  );

  return value;
}

export function ColumnVisibilityProvider(props: {
  value: TColumnVisibilityContext;
  children: React.ReactNode;
}) {
  return (
    <ColumnVisibilityContext.Provider value={props.value}>
      {props.children}
    </ColumnVisibilityContext.Provider>
  );
}

/**
 * The columns to show. Columns with disableHide are always shown, and when
 * every column would be hidden, all are shown.
 */
export function visibleColumns<T extends DataRecord>(
  cols: TTableColumn<T>[],
  hiddenKeys: string[]
): TTableColumn<T>[] {
  if (hiddenKeys.length === 0) return cols;

  const hidden = new Set(hiddenKeys);
  const visible = cols.filter(
    (col) => col.disableHide || !hidden.has(String(col.key))
  );
  return visible.length > 0 ? visible : cols;
}
