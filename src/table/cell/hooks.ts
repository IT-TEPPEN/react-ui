import { useMemo } from "react";
import { useEditActionContext } from "../edit/provider";
import { useColumnsContext } from "../sheet/providers";
import { DataObject, DataRecord, TColumnType } from "../table/type";
import { useRangeActionContext } from "../range/provider";
import { useTableIdGenerator } from "../id";

export function useCell(id: string, row: DataObject<DataRecord>) {
  const IdGenerator = useTableIdGenerator();
  const { startSelectRange, moveSelectRange, endSelectRange } =
    useRangeActionContext();
  const { startEditing } = useEditActionContext();
  const [rowIndex, colIndex] = IdGenerator.extractCellIndexFromId(id);
  const col = useColumnsContext()[colIndex];
  const value = row[col.key as string];

  const label =
    col.type === "select"
      ? col.options?.find((op) => op.value === value)?.label ?? ""
      : col.type === "date" || col.type === "datetime"
      ? col.render(value instanceof Date ? value : new Date(value))
      : (value as string | number);

  const component = useMemo(() => {
    if (col.type === "date" || col.type === "datetime" || col.editable) {
      return label;
    } else {
      return col.render ? col.render(value as never, row) : label;
    }
  }, [col.editable, label, value, row]);

  const type: TColumnType | "component" =
    !col.editable && col.render ? "component" : col.type;

  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    startEditing();
  };

  /**
   * onBlurよりも先に発火するため、onBlurでendEditingを呼ぶと
   * すぐにstartEditingが呼ばれてしまうため、setTimeoutで遅延させる
   * これにより、endEditingが先に呼ばれるようになる
   */
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const element = document.getElementById(IdGenerator.getEditorId());

    if (!!element) {
      return;
    }

    setTimeout(() => {
      startSelectRange({ rowIndex, colIndex });

      const onMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        endSelectRange();
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mouseup", onMouseUp);
    }, 0);
  };

  const onMouseEnter: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveSelectRange({ rowIndex, colIndex });
  };

  return {
    type,
    component,
    onDoubleClick,
    onMouseDown,
    onMouseEnter,
  };
}
