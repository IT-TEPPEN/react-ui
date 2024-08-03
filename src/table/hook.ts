import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataRecord, TPropsTable } from "./type";
import { usePageContext } from "./pagenation/providers";
import { useFilterContext } from "./filter";
import { useSortContext } from "./sort";
import {
  useFocusActionContext,
  useFocusContext,
  useFocusStateContext,
} from "./focus/provider";
import { useCheckboxStatusContext } from "./checkbox/provider";
import { useEditStateContext } from "./edit/provider";
import { useCellIndexContext } from "./cell/provider";

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
  const { isEditing } = useEditStateContext();
  const [occurredOnCellBlur, setOccurredOnCellBlur] = useState(false);
  const { isFocus } = useFocusStateContext();

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

export function useCell(rowIndex: number, colIndex: number) {
  const focus = useFocusActionContext();

  // useEffect(() => {
  //   if (!cell.editable && isFocus && isEditing) {
  //     finishEditing();
  //   }
  // }, [cell.editable, isFocus, isEditing, finishEditing]);

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

  // const onDoubleClickCellToEdit: React.MouseEventHandler<HTMLDivElement> =
  //   useCallback(
  //     (e) => {
  //       e.preventDefault();
  //       if (cell.editable) {
  //         focusAndEdit(cell.rowIndex, cell.colIndex);
  //       }
  //     },
  //     [cell.editable, focusAndEdit, cell.rowIndex, cell.colIndex]
  //   );

  const preventPropagation: React.MouseEventHandler<HTMLDivElement> =
    useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

  return {
    // isEditing,
    onClickCellToFocus,
    // onDoubleClickCellToEdit,
    preventPropagation,
  };
}
