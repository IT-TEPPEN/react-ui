import { useCallback, useMemo } from "react";
import { useEditActionContext } from "../edit/provider";
import { useFocusActionContext } from "../focus/provider";
import { useColumnsContext } from "../sheet/providers";
import { DataObject, DataRecord, TColumnType } from "../table/type";

export function useCell(
  rowIndex: number,
  colIndex: number,
  row: DataObject<DataRecord>
) {
  const focus = useFocusActionContext();
  const editAction = useEditActionContext();
  const col = useColumnsContext()[colIndex];
  const value = row[col.key as string];

  const label =
    col.type === "select"
      ? col.options?.find((op) => op.value === value)?.label
      : value;

  const component = useMemo(() => {
    if (col.editable) {
      return label;
    } else {
      return col.render ? col.render(value as never, row) : label;
    }
  }, [col.editable, label, value, row]);

  const type: TColumnType | "component" =
    !col.editable && col.render ? "component" : col.type;

  const focusAtCell = useCallback(() => {
    focus.move(rowIndex, colIndex);
    focus.focus(rowIndex, colIndex);
  }, [focus, rowIndex, colIndex]);

  const onDoubleClickCellToEdit: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        e.preventDefault();
        focus.move(rowIndex, colIndex);
        focus.focus(rowIndex, colIndex);
        editAction.startEditing();
      },
      [focus, editAction, rowIndex, colIndex]
    );

  return {
    type,
    component,
    focusAtCell,
    onDoubleClickCellToEdit,
  };
}
