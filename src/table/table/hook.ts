import { useEffect, useMemo } from "react";
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
import { useFilterFunctions } from "../filter-v2/context";

export function useTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { filter } = useFilterFunctions();
  const { sort, updatedData } = useSortActionContext();
  const sortTiming = useSortTimingContext();
  const { key: sortKey } = useSortStateContext();
  const { setRowCount, pageFilter } = usePageContext();
  const { dispatchCheckboxStatus } = useCheckboxStatusContext();
  const { setRows: setRowsForPaste } = usePasteActionContext();
  const { setRows: setRowsForCopy } = useCopyActionContext();
  const { setMaxDisplayColCount, setMaxDisplayRowCount } =
    useTablePropertyActionContext();

  // Re-run filter/sort only when the set of rows changes (rows added, removed
  // or replaced). Edits that keep the same ids keep the current order.
  const rowIdsKey = useMemo(
    () => JSON.stringify(props.rows.map((row) => row.id)),
    [props.rows]
  );

  const filteredRows = useMemo(
    () => filter(props.rows),
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

  // Select columns are sorted by the labels shown, not the stored values.
  // Keyed on the options' content so that a new cols array with the same
  // options (e.g. defined inline) does not re-sort on every render.
  const sortCol = props.cols.find((c) => c.key === sortKey);
  const sortLabelsKey =
    sortCol?.type === "select"
      ? JSON.stringify(sortCol.options.map((o) => [o.value, o.label]))
      : "";
  const getSortValue = useMemo(() => {
    if (sortLabelsKey === "") return undefined;

    const labels = new Map<unknown, string>(JSON.parse(sortLabelsKey));
    return (row: DataObject<T>) => {
      const value = row[sortKey as keyof T];
      return labels.get(value) ?? value;
    };
  }, [sortKey, sortLabelsKey]);

  const sortedRows = useMemo(
    () => sort(filteredRows, getSortValue),
    [filteredRows, sortTiming, getSortValue]
  );

  useEffect(() => {
    updatedData();
  }, [props.rows]);

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
