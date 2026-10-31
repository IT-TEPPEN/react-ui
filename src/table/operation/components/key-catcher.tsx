"use client";

import { useEffect, useRef, useState } from "react";
import { useRangeStateContext } from "../../range/provider";
import { useEditActionContext, useEditStateContext } from "../../edit/provider";
import { useColumnsContext } from "../../sheet/providers";
import { useTableIdGenerator } from "../../id";
import { KEY_CATCHER_ATTRIBUTE } from "../event-target";
import { setEditorInitialValue } from "../editor-input";

/**
 * A hidden input placed over the selected cell that holds the focus while a
 * cell is selected (and not being edited).
 *
 * Browsers only run an IME (e.g. Japanese input) while a text field has the
 * focus. Without this input, typing Japanese on a selected cell sent plain
 * letters and the first one was entered as is. While text is being composed
 * the input is shown over the cell, and when the composition is confirmed,
 * editing starts with the confirmed text.
 *
 * Other keys (arrows, copy, paste, ...) still reach the table's handlers.
 */
export function KeyCatcher() {
  const IdGenerator = useTableIdGenerator();
  const range = useRangeStateContext();
  const { isEditing } = useEditStateContext();
  const { startEditing } = useEditActionContext();
  const cols = useColumnsContext();
  const ref = useRef<HTMLInputElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  const active = range.isSelecting && !isEditing;

  useEffect(() => {
    if (active && document.activeElement !== ref.current) {
      ref.current?.focus({ preventScroll: true });
    }
  }, [active, range]);

  if (!range.isSelecting || isEditing) {
    return null;
  }

  const col = cols[range.start.colIndex];
  const { start } = range;

  return (
    <input
      ref={ref}
      {...{ [KEY_CATCHER_ATTRIBUTE]: "" }}
      aria-label={col?.label ?? String(col?.key ?? "")}
      autoComplete="off"
      tabIndex={-1}
      className={`absolute z-10 px-2 text-[color:var(--teppen-table-text,#111827)] outline-none ${
        isComposing ? "bg-[color:var(--teppen-table-bg,#ffffff)] border border-[color:var(--teppen-table-selection-border,#6b7280)]" : "opacity-0"
      }`}
      style={{
        top: start.yStart,
        left: start.xStart,
        width: start.xEnd - start.xStart,
        height: start.yEnd - start.yStart,
        pointerEvents: "none",
      }}
      onCompositionStart={() => {
        setIsComposing(true);
      }}
      onCompositionEnd={(e) => {
        const text = e.data;
        setIsComposing(false);
        e.currentTarget.value = "";

        if (text && col?.editable) {
          startEditing();
          setTimeout(() => {
            setEditorInitialValue(text, IdGenerator.getEditorId());
          }, 10);
        }
      }}
      onInput={(e) => {
        // Outside of IME composition every typed key is handled on keydown,
        // so nothing should stay in this input.
        if (!isComposing) {
          e.currentTarget.value = "";
        }
      }}
    />
  );
}
