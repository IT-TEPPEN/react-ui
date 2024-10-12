import { useMemo } from "react";
import { useEditActionContext } from "../edit/provider";
import { useFocusActionContext } from "../focus/provider";
import { useColumnsContext } from "../sheet/providers";
import { DataObject, DataRecord, TColumnType } from "../table/type";
import { IdGenerator } from "../libs";

export function useCell(id: string, row: DataObject<DataRecord>) {
  const { move, focus } = useFocusActionContext();
  const { startEditing } = useEditActionContext();
  const [rowIndex, colIndex] = IdGenerator.getCellIndex(id);
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

  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    focus(rowIndex, colIndex);
    move(rowIndex, colIndex);
    startEditing();
  };

  const onClickCell: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    focus(rowIndex, colIndex);
    move(rowIndex, colIndex);
  };

  return {
    type,
    component,
    onClickCell,
    onDoubleClick,
  };
}
