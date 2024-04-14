import { useEffect, useMemo, useState } from "react";
import { DataObject, TPropsTable } from "./type";
import { usePageContext } from "./pagenation/providers";
import { useFilterContext } from "./filter";
type State = {
  key: string;
  order: "ASC" | "DESC";
};

export function useTable<T extends DataObject>(props: TPropsTable<T>) {
  const [key, changeKey] = useState<State>({ key: "id", order: "ASC" });
  const { filter, addFilter, removeFilter, clearFilter, filterConditions } =
    useFilterContext();
  const { setRowCount, pageFilter } = usePageContext();

  const { cols } = props;

  const filteredRows = useMemo(() => filter(props.rows), [filter, props.rows]);

  useEffect(() => {
    setRowCount(filteredRows.length);
  }, [filteredRows.length]);

  const sortedRows = useMemo(
    () =>
      [...filteredRows].sort((a, b) => {
        if (a[key.key] < b[key.key]) {
          return key.order === "ASC" ? -1 : 1;
        }
        if (a[key.key] > b[key.key]) {
          return key.order === "ASC" ? 1 : -1;
        }
        return 0;
      }),
    [filteredRows, key.key, key.order]
  );

  const colsWithSort = cols.map((col) => ({
    ...col,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (key.key === col.key) {
        changeKey({
          key: col.key,
          order: key.order === "ASC" ? "DESC" : "ASC",
        });
      } else {
        changeKey({ key: col.key, order: "ASC" });
      }
    },
  }));

  const pageRows = useMemo(
    () => pageFilter(sortedRows),
    [pageFilter, sortedRows]
  );

  return {
    cols: colsWithSort,
    rows: pageRows,
    rowCount: filteredRows.length,
    sortKey: key.key,
    sortOrder: key.order,
    filter: {
      add: addFilter,
      remove: removeFilter,
      clear: clearFilter,
      conditions: filterConditions,
    },
  };
}
