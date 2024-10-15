import { useEffect, useState } from "react";
import { useTablePropertyContext } from "../table/provider";

export function useEditor() {
  const t = useTablePropertyContext();
  const [updateCount, setUpdateCount] = useState(0);
  const [returnValue, setReturnValue] = useState<{
    id: string;
    type: "string" | "number" | "select";
    isEditing: boolean;
  }>({
    ...t.getEditStatus(),
    id: t.getFocusedCellId() || "",
  });

  const update = () => {
    setUpdateCount((prev) => prev + 1);
  };

  useEffect(() => {
    t.setUpdateEditorFunction(update);
    return () => {
      t.setUpdateEditorFunction(() => {});
    };
  }, []);

  useEffect(() => {
    setReturnValue({
      ...t.getEditStatus(),
      id: t.getFocusedCellId() || "",
    });
  }, [updateCount]);

  return returnValue;
}

export function useForm() {
  const t = useTablePropertyContext();
  const { rowIndex, colIndex } = t.getFocusedCellIndex();
  const col = t.cols[colIndex];

  if (col.type === "select" && col.editable) {
    return {
      type: "select" as const,
      prevValue: t.getFocusedCellValue(),
      updateCellValue: t.getOnCellBlur(rowIndex, colIndex),
      switchToFocusMode: () => t.switchToFocusMode(),
      allowEmpty: col.allowEmpty,
      options: col.options,
    };
  } else if (col.type === "number") {
    return {
      type: "number" as const,
      prevValue: t.getFocusedCellValue(),
      updateCellValue: t.getOnCellBlur(rowIndex, colIndex),
      switchToFocusMode: () => t.switchToFocusMode(),
    };
  } else if (col.type === "string") {
    return {
      type: "string" as const,
      prevValue: t.getFocusedCellValue(),
      updateCellValue: t.getOnCellBlur(rowIndex, colIndex),
      switchToFocusMode: () => t.switchToFocusMode(),
    };
  } else {
    return {
      type: "no-type" as const,
    };
  }
}
