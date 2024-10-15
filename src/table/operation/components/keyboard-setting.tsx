import { useEffect } from "react";
import { useTablePropertyStateContext } from "../../table-property/provider";
import { useFocusContext } from "../../focus/provider";
import { useEditContext } from "../../edit/provider";
import { useColumnsContext } from "../../sheet/providers";

const setInitialValueToInputForm = (key: string) => {
  const inputElement = document.getElementById("edit-input");
  if (inputElement) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(inputElement, key);
    }

    const ev = new Event("input", { bubbles: true });
    inputElement.dispatchEvent(ev);
  }
};

export function KeyboardSetting() {
  const focus = useFocusContext();
  const edit = useEditContext();
  const { maxDisplayColCount, maxDisplayRowCount } =
    useTablePropertyStateContext();
  const col = useColumnsContext()[focus.isFocus ? focus.colIndex : 0];

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
        } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          edit.startEditing();

          setTimeout(() => {
            setInitialValueToInputForm(e.key);
          }, 10);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          e.stopPropagation();
          edit.startEditing();

          setTimeout(() => {
            setInitialValueToInputForm("");
          }, 10);
        }
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [edit.isEditing, focus.isFocus, rowIndex, colIndex]);

  useEffect(() => {
    if (edit.isEditing && !col.editable) {
      edit.endEditing();
    }
  }, [edit, col]);

  return <></>;
}
