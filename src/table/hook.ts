import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataRecord, TPropsTable } from "./type";
import { usePageContext } from "./pagenation/providers";
import { useFilterContext } from "./filter";
import { useSortContext } from "./sort";
import { useFocusContext } from "./edit/provider";
import { useCellContext, useCellIsFocusContext } from "./sheet/providers";
import { useCheckboxStatusContext } from "./checkbox/provider";

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

export function useCellFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { isEditing } = useFocusContext();
  const [occurredOnCellBlur, setOccurredOnCellBlur] = useState(false);
  const isFocus = useCellIsFocusContext();

  useEffect(() => {
    if (isFocus && isEditing) {
      ref.current?.focus();
    }
    setOccurredOnCellBlur(false);
  }, [isFocus, isEditing, occurredOnCellBlur]);

  const callbackAfterBlur = useCallback(() => {
    setOccurredOnCellBlur(true);
  }, []);

  return { ref, callbackAfterBlur };
}

export function useCell() {
  const cell = useCellContext();
  const { isEditing, focus, focusAndEdit, finishEditing } = useFocusContext();
  const isFocus = useCellIsFocusContext();

  useEffect(() => {
    if (!cell.editable && isFocus && isEditing) {
      finishEditing();
    }
  }, [cell.editable, isFocus, isEditing, finishEditing]);

  const onClickCellToFocus: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        focus(cell.rowIndex, cell.colIndex);
      },
      [focus, cell.rowIndex, cell.colIndex]
    );

  const onDoubleClickCellToEdit: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        e.preventDefault();
        if (cell.editable) {
          focusAndEdit(cell.rowIndex, cell.colIndex);
        }
      },
      [cell.editable, focusAndEdit, cell.rowIndex, cell.colIndex]
    );

  const preventPropagation: React.MouseEventHandler<HTMLDivElement> =
    useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

  return {
    cell,
    isEditing,
    onClickCellToFocus,
    onDoubleClickCellToEdit,
    preventPropagation,
  };
}
