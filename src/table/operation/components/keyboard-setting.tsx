import { useEffect } from "react";
import { useTablePropertyStateContext } from "../../table-property/provider";
import { useFocusContext } from "../../focus/provider";
import { useEditContext } from "../../edit/provider";

export function KeyboardSetting() {
  const focus = useFocusContext();
  const edit = useEditContext();
  const { maxDisplayColCount, maxDisplayRowCount } =
    useTablePropertyStateContext();

  const rowIndex = focus.isFocus ? focus.rowIndex : -1;
  const colIndex = focus.isFocus ? focus.colIndex : -1;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (edit.isEditing) {
        if (e.key === "Escape") {
          e.preventDefault();
          edit.endEditing();
        }
      } else if (focus.isFocus) {
        if (e.key === "Enter") {
          e.preventDefault();
          focus.moveDown();
        } else if (e.key === "Escape") {
          e.preventDefault();
          focus.unfocus();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();

          if (focus.colIndex === maxDisplayColCount - 1) return;

          focus.moveRight();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();

          if (focus.colIndex === 0) return;

          focus.moveLeft();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();

          if (focus.rowIndex === 0) return;

          focus.moveUp();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();

          if (focus.rowIndex === maxDisplayRowCount - 1) return;

          focus.moveDown();
        } else if (e.key === "F2") {
          e.preventDefault();
          edit.startEditing();
        }
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [edit.isEditing, focus.isFocus, rowIndex, colIndex]);

  return <></>;
}
