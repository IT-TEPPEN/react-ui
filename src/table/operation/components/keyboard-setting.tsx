"use client";

import { useEffect } from "react";
import { useEditContext } from "../../edit/provider";
import { useColumnsContext } from "../../sheet/providers";
import { useRangeContext } from "../../range/provider";
import { useCopyActionContext } from "../../copy/provider";
import { useTableIdGenerator } from "../../id";

const setInitialValueToInputForm = (key: string, id: string) => {
  const inputElement = document.getElementById(id);
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
  const IdGenerator = useTableIdGenerator();
  const edit = useEditContext();
  const range = useRangeContext();
  const { copy } = useCopyActionContext();
  const col = useColumnsContext()[range.isSelecting ? range.start.colIndex : 0];

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (edit.isEditing) {
        if (e.key === "Escape") {
          e.preventDefault();
          edit.endEditing();
        }
      } else if (range.isSelecting) {
        if (e.key === "Enter") {
          e.preventDefault();
          range.moveDown();
        } else if (e.key === "Escape") {
          e.preventDefault();
          range.reset();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();

          if (e.shiftKey) {
            range.extendRight();
          } else {
            range.moveRight();
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();

          if (e.shiftKey) {
            range.extendLeft();
          } else {
            range.moveLeft();
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();

          if (e.shiftKey) {
            range.extendUp();
          } else {
            range.moveUp();
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();

          if (e.shiftKey) {
            range.extendDown();
          } else {
            range.moveDown();
          }
        } else if (e.key === "F2") {
          e.preventDefault();
          edit.startEditing();
        } else if (e.ctrlKey && e.key === "c") {
          e.preventDefault();
          copy();
        } else if (!e.altKey && !e.ctrlKey && /^[a-zA-Z0-9]$/.test(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          edit.startEditing();

          setTimeout(() => {
            setInitialValueToInputForm(e.key, IdGenerator.getEditorId());
          }, 10);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          e.stopPropagation();
          edit.startEditing();

          setTimeout(() => {
            setInitialValueToInputForm("", IdGenerator.getEditorId());
          }, 10);
        }
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [range, edit.isEditing]);

  useEffect(() => {
    if (edit.isEditing && !col.editable) {
      edit.endEditing();
    }
  }, [edit, col]);

  return <></>;
}
