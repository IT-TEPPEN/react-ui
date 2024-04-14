import { useEffect, useMemo } from "react";
import { DataObject, TPropsTable } from "./type";
import { usePageContext } from "./pagenation/providers";
import { useFilterContext } from "./filter";
import { useSortContext } from "./sort";

export function useTable<T extends DataObject>(props: TPropsTable<T>) {
  const { filter, addFilter, removeFilter, clearFilter, filterConditions } =
    useFilterContext();
  const { sort } = useSortContext();
  const { setRowCount, pageFilter } = usePageContext();

  const filteredRows = useMemo(() => filter(props.rows), [filter, props.rows]);

  useEffect(() => {
    setRowCount(filteredRows.length);
  }, [filteredRows.length]);

  const sortedRows = useMemo(() => sort(filteredRows), [filteredRows, sort]);

  const pageRows = useMemo(
    () => pageFilter(sortedRows),
    [pageFilter, sortedRows]
  );

  return {
    cols: props.cols,
    rows: pageRows,
    rowCount: filteredRows.length,
    filter: {
      add: addFilter,
      remove: removeFilter,
      clear: clearFilter,
      conditions: filterConditions,
    },
  };
}
