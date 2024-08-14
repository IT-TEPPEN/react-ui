import { useCallback, useEffect, useMemo } from "react";
import { DataRecord, TPropsTable } from "./type";
import { usePageContext } from "./pagenation/providers";
import { useFilterContext } from "./filter";
import { useSortContext } from "./sort";
import { useFocusActionContext } from "./focus/provider";
import { useCheckboxStatusContext } from "./checkbox/provider";
import { useEditActionContext } from "./edit/provider";

export function useTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { filter } = useFilterContext();
  const { sort } = useSortContext();
  const { setRowCount, pageFilter } = usePageContext();
  const { dispatchCheckboxStatus } = useCheckboxStatusContext();

  const filteredRows = useMemo(() => filter(props.rows), [filter, props.rows]);

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

  const sortedRows = useMemo(() => sort(filteredRows), [filteredRows, sort]);

  const pageRows = useMemo(
    () => pageFilter(sortedRows),
    [pageFilter, sortedRows]
  );

  return {
    cols: props.cols,
    rows: pageRows,
  };
}

export function useCell(rowIndex: number, colIndex: number) {
  const focus = useFocusActionContext();
  const editAction = useEditActionContext();

  const onClickCellToFocus: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        focus.move(rowIndex, colIndex);
        focus.focus(rowIndex, colIndex);
      },
      [focus, rowIndex, colIndex]
    );

  const onDoubleClickCellToEdit: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        e.preventDefault();
        focus.move(rowIndex, colIndex);
        focus.focus(rowIndex, colIndex);
        editAction.startEditing();
      },
      [focus, editAction]
    );

  const preventPropagation: React.MouseEventHandler<HTMLDivElement> =
    useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

  return {
    onClickCellToFocus,
    onDoubleClickCellToEdit,
    preventPropagation,
  };
}
