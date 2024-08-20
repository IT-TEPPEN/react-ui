import { useEffect } from "react";
import { useFocusContext } from "../../focus/provider";
import { useEditContext } from "../../edit/provider";
import { IdGenerator } from "../../libs";

export function AutoSwitchEditMode() {
  const focus = useFocusContext();
  const edit = useEditContext();

  useEffect(() => {
    if (focus.isFocus && edit.isEditing) {
      const id = IdGenerator.getTableCellId(focus.rowIndex, focus.colIndex);

      const cellDisplayElement = document.getElementById(`${id}-display`);
      const cellEditorElement = document.getElementById(`${id}-editor`);
      cellDisplayElement?.style.setProperty("opacity", "0");
      cellEditorElement?.style.setProperty("opacity", "1");
      cellEditorElement?.style.setProperty("pointer-events", "auto");
      cellEditorElement?.querySelector("input")?.focus();
      cellEditorElement?.querySelector("select")?.focus();
    }

    return () => {
      if (focus.isFocus && edit.isEditing) {
        const id = IdGenerator.getTableCellId(focus.rowIndex, focus.colIndex);

        const cellDisplayElement = document.getElementById(`${id}-display`);
        const cellEditorElement = document.getElementById(`${id}-editor`);
        cellDisplayElement?.style.setProperty("opacity", "1");
        cellEditorElement?.style.setProperty("opacity", "0");
        cellEditorElement?.style.setProperty("pointer-events", "none");
      }
    };
  }, [edit.isEditing]);

  return <></>;
}
