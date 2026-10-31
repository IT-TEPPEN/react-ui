import { useEffect, useMemo, useRef } from "react";
import { DataObject, DataRecord, TPropsTable } from "./type";
import { usePageContext } from "../pagenation/providers";
import { useCheckboxStatusContext } from "../checkbox/provider";
import {
  useSortActionContext,
  useSortStateContext,
  useSortTimingContext,
} from "../sort/provider";
import { useTablePropertyActionContext } from "../table-property/provider";
import { usePasteActionContext } from "../paste/provider";
import { useCopyActionContext } from "../copy/provider";
import { useFilterFunctions, useFilterState } from "../filter-v2/context";
import { fromCondition } from "../filter-v2/public";
import { buildKeywordTextGetter } from "../filter-v2/keyword";
import { filterValueOf } from "./column-options";

export function useTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { filter } = useFilterFunctions();
  const { sort, updatedData } = useSortActionContext();
  const sortTiming = useSortTimingContext();
  const { key: sortKey, asc: sortAsc } = useSortStateContext();
  const { conditions, mode } = useFilterState();
  const { setRowCount, pageFilter } = usePageContext();
  const { dispatchCheckboxStatus } = useCheckboxStatusContext();
  const { setRows: setRowsForPaste } = usePasteActionContext();
  const { setRows: setRowsForCopy } = useCopyActionContext();
  const { setMaxDisplayColCount, setMaxDisplayRowCount } =
    useTablePropertyActionContext();

  // The latest cols, read when sorting or filtering runs. Kept in a ref so
  // that cols defined inline (a new array and new functions on every
  // render) do not re-sort or re-filter on every render.
  const colsRef = useRef(props.cols);
  colsRef.current = props.cols;

  // Re-run filter/sort only when the set of rows changes (rows added, removed
  // or replaced). Edits that keep the same ids keep the current order.
  const rowIdsKey = useMemo(
    () => JSON.stringify(props.rows.map((row) => row.id)),
    [props.rows]
  );

  // Text the all-columns keyword search looks in. Not a dependency of
  // filteredRows, so a new cols array (e.g. defined inline) does not re-filter.
  const getKeywordText = useMemo(
    () => buildKeywordTextGetter(props.cols),
    [props.cols]
  );

  // The value a condition compares: the column's filterValue, if any.
  const getFilterValue = (row: DataObject<T>, key: string) => {
    const col = colsRef.current.find((c) => c.key === key);
    return col ? filterValueOf(col, row) : row[key];
  };

  const filteredRows = useMemo(
    () => filter(props.rows, getKeywordText, getFilterValue),
    [filter, sortTiming, rowIdsKey]
  );

  useEffect(() => {
    setRowCount(filteredRows.length);
  }, [filteredRows.length]);

  const checkBoxes = useMemo(() => {
    if (!props.checkbox) {
      return [];
    }

    return props.rows.filter((row) => props.checkbox?.checked(row));
  }, [props.checkbox, props.rows]);

  useEffect(() => {
    dispatchCheckboxStatus({
      type: "SET",
      payload: { checkedRecords: checkBoxes },
    });
  }, [checkBoxes]);

  // Sort by the column's sortValue if it has one; select columns otherwise
  // by the labels shown, not the stored values.
  const sortCol = props.cols.find((c) => c.key === sortKey);
  const hasSortValue = !!sortCol?.sortValue;
  const sortLabelsKey =
    !hasSortValue && sortCol?.type === "select"
      ? JSON.stringify(sortCol.options.map((o) => [o.value, o.label]))
      : "";
  const getSortValue = useMemo(() => {
    if (hasSortValue) {
      return (row: DataObject<T>) =>
        colsRef.current.find((c) => c.key === sortKey)?.sortValue?.(row);
    }
    if (sortLabelsKey === "") return undefined;

    const labels = new Map<unknown, string>(JSON.parse(sortLabelsKey));
    return (row: DataObject<T>) => {
      const value = row[sortKey as keyof T];
      return labels.get(value) ?? value;
    };
  }, [sortKey, sortLabelsKey, hasSortValue]);

  const sortedRows = useMemo(
    () => sort(filteredRows, getSortValue),
    [filteredRows, sortTiming, getSortValue]
  );

  useEffect(() => {
    updatedData();
  }, [props.rows]);

  // Tell the app about the filters, sort and resulting rows. Read the
  // callback through a ref so a new function does not trigger a call.
  const onConditionChangeRef = useRef(props.onConditionChange);
  useEffect(() => {
    onConditionChangeRef.current = props.onConditionChange;
  });

  useEffect(() => {
    const onConditionChange = onConditionChangeRef.current;
    if (!onConditionChange) return;

    // sortedRows keeps row objects from when it was computed; give the app
    // the current objects for the same rows.
    const current = new Map(props.rows.map((row) => [row.id, row]));
    onConditionChange(
      {
        filters: conditions.map(fromCondition),
        filterMode: mode,
        sort: { key: String(sortKey), asc: sortAsc },
      },
      sortedRows.map((row) => current.get(row.id) ?? row)
    );
  }, [conditions, mode, sortKey, sortAsc, sortedRows, props.rows]);

  const pageRows = useMemo(
    () => pageFilter(sortedRows),
    [pageFilter, sortedRows]
  );

  const pageRowIds = useMemo(() => pageRows.map((row) => row.id), [pageRows]);
  const pageRowIdSets = useMemo(() => new Set(pageRowIds), [pageRowIds]);

  // Rows on the current page by id. `data` is the row object passed in
  // through props, so callbacks receive it unchanged (Date values stay Date).
  const rowMaps = useMemo(
    () =>
      props.rows
        .filter((row) => pageRowIdSets.has(row.id))
        .reduce((acc, row) => {
          acc[row.id] = { data: row };
          return acc;
        }, {} as { [id: string | number]: { data: DataObject<any> } }),
    [props.rows, pageRowIdSets]
  );

  useEffect(() => {
    setMaxDisplayColCount(props.cols.length);
  }, [props.cols.length]);

  useEffect(() => {
    setMaxDisplayRowCount(pageRowIds.length);
  }, [pageRowIds.length]);

  useEffect(() => {
    const rows = pageRowIds.map((id) => rowMaps[id].data);
    setRowsForCopy(rows);
    setRowsForPaste(rows);
  }, [rowMaps]);

  return {
    cols: props.cols,
    rowMaps,
    pageRowIds,
  };
}
