import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DataRecord, TPropsTable } from "./type";
import { usePageContext } from "./pagenation/providers";
import { useFilterContext } from "./filter";
import { useSortContext } from "./sort";
import { useFocusContext } from "./edit/provider";
import { useCellContext } from "./sheet/providers";

export function useTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { filter } = useFilterContext();
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
  };
}

export function useCellFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { rowIndex, colIndex } = useCellContext();
  const { isEditing, checkFocus } = useFocusContext();
  const [occurredOnCellBlur, setOccurredOnCellBlur] = useState(false);

  const isFocus = checkFocus(rowIndex, colIndex);

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
  const { isEditing, checkFocus, focus, focusAndEdit, finishEditing } =
    useFocusContext();

  const isFocus = checkFocus(cell.rowIndex, cell.colIndex);

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
    isFocus,
    isEditing,
    onClickCellToFocus,
    onDoubleClickCellToEdit,
    preventPropagation,
  };
}
