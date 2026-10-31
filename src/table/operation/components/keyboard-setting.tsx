"use client";

import { useEffect, useRef } from "react";
import { useEditContext } from "../../edit/provider";
import { useColumnsContext } from "../../sheet/providers";
import { useRangeContext } from "../../range/provider";
import { useCopyActionContext } from "../../copy/provider";
import { useTableIdGenerator } from "../../id";
import { isComposingKey, isTextEntryTarget } from "../event-target";
import { setEditorInitialValue } from "../editor-input";

export function KeyboardSetting(options?: { enableDeprecatedCopy?: boolean }) {
  const IdGenerator = useTableIdGenerator();
  const edit = useEditContext();
  const range = useRangeContext();
  const { copy } = useCopyActionContext();
  const col = useColumnsContext()[range.isSelecting ? range.start.colIndex : 0];

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (isComposingKey(e)) {
        return;
      }

      if (edit.isEditing) {
        if (e.key === "Escape") {
          e.preventDefault();
          edit.endEditing();
        }
      } else if (range.isSelecting && !isTextEntryTarget(e.target)) {
        if (e.key === "Enter") {
          e.preventDefault();
          if (e.shiftKey) {
            range.moveUp();
          } else {
            range.moveDown();
          }
        } else if (e.key === "Tab") {
          e.preventDefault();
          if (e.shiftKey) {
            range.moveLeft();
          } else {
            range.moveRight();
          }
        } else if (e.key === "Escape") {
          e.preventDefault();
          range.reset();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();

          if (e.ctrlKey && e.shiftKey) {
            range.extendRightEnd();
          } else if (e.ctrlKey) {
            range.moveRightEnd();
          } else if (e.shiftKey) {
            range.extendRight();
          } else {
            range.moveRight();
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();

          if (e.ctrlKey && e.shiftKey) {
            range.extendLeftEnd();
          } else if (e.ctrlKey) {
            range.moveLeftEnd();
          } else if (e.shiftKey) {
            range.extendLeft();
          } else {
            range.moveLeft();
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();

          if (e.ctrlKey && e.shiftKey) {
            range.extendTop();
          } else if (e.ctrlKey) {
            range.moveTop();
          } else if (e.shiftKey) {
            range.extendUp();
          } else {
            range.moveUp();
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();

          if (e.ctrlKey && e.shiftKey) {
            range.extendBottom();
          } else if (e.ctrlKey) {
            range.moveBottom();
          } else if (e.shiftKey) {
            range.extendDown();
          } else {
            range.moveDown();
          }
        } else if (e.key === "F2") {
          e.preventDefault();
          edit.startEditing();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
          e.preventDefault();
          copy({ enableDeprecatedCopy: options?.enableDeprecatedCopy });
        } else if (
          !e.altKey &&
          !e.ctrlKey &&
          !e.metaKey &&
          // Any key that types one character (letters, digits, symbols,
          // space). IME input is handled by KeyCatcher instead.
          Array.from(e.key).length === 1
        ) {
          e.preventDefault();
          e.stopPropagation();
          edit.startEditing();

          setTimeout(() => {
            setEditorInitialValue(e.key, IdGenerator.getEditorId());
          }, 10);
        } else if (e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
          e.stopPropagation();
          edit.startEditing();

          setTimeout(() => {
            setEditorInitialValue("", IdGenerator.getEditorId());
          }, 10);
        }
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [range, edit.isEditing]);

  // After a cell is committed with Enter / Tab, move the selection once
  // editing has actually ended.
  const wasEditing = useRef(edit.isEditing);
  useEffect(() => {
    if (wasEditing.current && !edit.isEditing) {
      const move = edit.takeMoveAfterEditing();
      if (move === "up") range.moveUp();
      if (move === "down") range.moveDown();
      if (move === "left") range.moveLeft();
      if (move === "right") range.moveRight();
    }
    wasEditing.current = edit.isEditing;
  }, [edit.isEditing]);

  useEffect(() => {
    if (edit.isEditing && !col.editable) {
      edit.endEditing();
    }
  }, [edit, col]);

  return <></>;
}
