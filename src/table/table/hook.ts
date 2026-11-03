import { useEffect, useMemo, useRef } from "react";
import { DataObject, DataRecord, TPropsTable, TTableColumn } from "./type";
import { useColumnVisibility } from "../column-visibility";
import { usePageContext } from "../pagenation/providers";
import { useCheckboxStatusContext } from "../checkbox/provider";
import {
  useSortActionContext,
  useSortStateContext,
  useSortTimingContext,
} from "../sort/provider";
import { useTablePropertyActionContext } from "../table-property/provider";
import { useFilterFunctions, useFilterState } from "../filter-v2/context";
import { fromCondition } from "../filter-v2/public";
import { buildKeywordTextGetter } from "../filter-v2/keyword";
import { filterValueOf } from "./column-options";
import { useColumnsWidthState } from "../header";
import { useShownRows } from "../shown-rows/provider";

export function useTable<T extends DataRecord>(
  props: TPropsTable<T>,
  visibleCols: TTableColumn<T>[] = props.cols
) {
  const { hiddenKeys } = useColumnVisibility();
  const { filter } = useFilterFunctions();
  const { sort, updatedData } = useSortActionContext();
  const sortTiming = useSortTimingContext();
  const { sorts, key: sortKey, asc: sortAsc } = useSortStateContext();
  const { conditions, mode } = useFilterState();
  const {
    setRowCount,
    pageFilter,
    enable: paginationEnabled,
    perPage,
    current: currentPage,
  } = usePageContext();
  const { committedWidths } = useColumnsWidthState();
  const { dispatchCheckboxStatus } = useCheckboxStatusContext();
  const shownRows = useShownRows();
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

  // Checked again on every render (checked may read app state), but only
  // passed on when other rows are checked, so the checkboxes are not all
  // drawn again for nothing.
  const checkedIdsKey = JSON.stringify(checkBoxes.map((row) => row.id));
  useEffect(() => {
    dispatchCheckboxStatus({
      type: "SET",
      payload: { checkedRecords: checkBoxes },
    });
  }, [checkedIdsKey]);

  // For each sort condition, what to compare: the column's sortValue if it
  // has one; for select columns the labels shown, not the stored values.
  // Keyed on content, so cols defined inline do not re-sort.
  const sortSpecKey = JSON.stringify(
    sorts.map(({ key }) => {
      const col = props.cols.find((c) => c.key === key);
      if (col?.sortValue) return [key, "sortValue"];
      if (col?.type === "select") {
        return [key, "labels", col.options.map((o) => [o.value, o.label])];
      }
      return [key, "value"];
    })
  );
  const getSortValues = useMemo(
    () =>
      (JSON.parse(sortSpecKey) as [string, string, [unknown, string][]?][]).map(
        ([key, kind, options]) => {
          if (kind === "sortValue") {
            return (row: DataObject<T>) =>
              colsRef.current.find((c) => c.key === key)?.sortValue?.(row);
          }
          if (kind === "labels") {
            const labels = new Map(options);
            return (row: DataObject<T>) => {
              const value = row[key as keyof T];
              return labels.get(value) ?? value;
            };
          }
          return undefined;
        }
      ),
    [sortSpecKey]
  );

  const sortedRows = useMemo(
    () => sort(filteredRows, getSortValues),
    [filteredRows, sortTiming, getSortValues]
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
        sorts: sorts.map(({ key, asc }) => ({ key, asc })),
        pagination: {
          rowCountPerPage: paginationEnabled ? perPage : "all",
          page: paginationEnabled ? currentPage : 1,
        },
        columnWidths: { ...committedWidths },
        hiddenColumns: [...hiddenKeys],
      },
      sortedRows.map((row) => current.get(row.id) ?? row)
    );
  }, [
    conditions,
    mode,
    sorts,
    sortKey,
    sortAsc,
    sortedRows,
    props.rows,
    paginationEnabled,
    perPage,
    currentPage,
    committedWidths,
    hiddenKeys,
  ]);

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
        .reduce(
          (acc, row) => {
            acc[row.id] = { data: row };
            return acc;
          },
          {} as { [id: string | number]: { data: DataObject<T> } }
        ),
    [props.rows, pageRowIdSets]
  );

  useEffect(() => {
    setMaxDisplayColCount(visibleCols.length);
  }, [visibleCols.length]);

  useEffect(() => {
    setMaxDisplayRowCount(pageRowIds.length);
  }, [pageRowIds.length]);

  // The rows copy and paste work on, in the order shown.
  useEffect(() => {
    shownRows.current = pageRowIds.map((id) => rowMaps[id].data);
  }, [rowMaps]);

  // Rows the checkbox in the header checks (checkbox.selectAll). Sorting and
  // paging keep row objects from when they ran, so give the current ones.
  const selectAll = props.checkbox?.selectAll ?? "all";
  const selectAllRows = useMemo(() => {
    if (selectAll === "all") return props.rows;

    const current = new Map(props.rows.map((row) => [row.id, row]));
    const scope = selectAll === "page" ? pageRows : sortedRows;
    return scope.map((row) => current.get(row.id) ?? row);
  }, [selectAll, props.rows, pageRows, sortedRows]);

  return {
    selectAllRows,
    cols: visibleCols,
    rowMaps,
    pageRowIds,
  };
}
