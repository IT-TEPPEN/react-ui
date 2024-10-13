import { useEffect, useMemo } from "react";
import { DataObject, DataRecord, TPropsTable } from "./type";
import { usePageContext } from "../pagenation/providers";
import { useFilterContext } from "../filter";
import { useCheckboxStatusContext } from "../checkbox/provider";
import { useSortActionContext, useSortTimingContext } from "../sort/provider";
import { useTablePropertyActionContext } from "../table-property/provider";
import { usePasteActionContext } from "../paste/provider";

export function useTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { filter } = useFilterContext();
  const { sort, updatedData } = useSortActionContext();
  const sortTiming = useSortTimingContext();
  const { setRowCount, pageFilter } = usePageContext();
  const { dispatchCheckboxStatus } = useCheckboxStatusContext();
  const { setRows } = usePasteActionContext();
  const { setMaxDisplayColCount, setMaxDisplayRowCount } =
    useTablePropertyActionContext();

  const filteredRows = useMemo(
    () => filter(props.rows),
    [filter, sortTiming, props.rows.length]
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

  const sortedRows = useMemo(
    () => sort(filteredRows),
    [filteredRows, sortTiming]
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

  const rowMaps = useMemo(
    () =>
      props.rows
        .filter((row) => pageRowIdSets.has(row.id))
        .reduce((acc, row) => {
          const rowSortedByKey = Object.keys(row)
            .sort()
            .reduce((acc, key) => {
              acc[key] = row[key];
              return acc;
            }, {} as { [key: string]: string | number });

          acc[row.id] = {
            data: rowSortedByKey,
            stringValue: JSON.stringify(rowSortedByKey),
          };
          return acc;
        }, {} as { [id: string | number]: { data: DataObject<any>; stringValue: string } }),
    [props.rows, pageRowIdSets]
  );

  useEffect(() => {
    setMaxDisplayColCount(props.cols.length);
  }, [props.cols.length]);

  useEffect(() => {
    setMaxDisplayRowCount(pageRowIds.length);
  }, [pageRowIds.length]);

  useEffect(() => {
    setRows(pageRowIds.map((id) => rowMaps[id].data));
  }, [rowMaps]);

  return {
    cols: props.cols,
    rowMaps,
    pageRowIds,
  };
}