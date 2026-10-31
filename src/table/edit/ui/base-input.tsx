"use client";

import { useEffect, useRef } from "react";
import { CancelIcon } from "../../../icon/cancel-icon";
import { useTableIdGenerator } from "../../id";
import { isComposingKey } from "../../operation/event-target";
import { useEditActionContext } from "../provider";

export function CellInput(props: {
  type?: "text";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  reset: () => void;
  endEditing: () => void;
}) {
  const IdGenerator = useTableIdGenerator();
  const { setMoveAfterEditing } = useEditActionContext();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  return (
    <div
      className={`flex justify-between gap-1 w-full items-center`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <input
        id={IdGenerator.getEditorId()}
        ref={ref}
        className="w-full py-1 px-2 bg-[color:var(--teppen-table-bg,#ffffff)] text-[color:var(--teppen-table-text,#111827)]"
        type={props.type ?? "text"}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        // Back in the editor (e.g. after a validation error): forget the
        // move, so committing later by other means does not move.
        onFocus={() => setMoveAfterEditing(null)}
        // Handled on keydown so that keys used by an IME (e.g. Enter to
        // confirm or Escape to cancel Japanese conversion) can be told apart
        // and ignored; on keyup they look like plain Enter / Escape.
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (isComposingKey(e.nativeEvent)) {
            return;
          }

          // Enter / Tab commit the value and then move, as in a spreadsheet:
          // Enter down (Shift: up), Tab right (Shift: left).
          if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            setMoveAfterEditing(
              e.key === "Enter"
                ? e.shiftKey
                  ? "up"
                  : "down"
                : e.shiftKey
                ? "left"
                : "right"
            );
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            e.preventDefault();
            props.reset();
            props.endEditing();
          }
        }}
      />
      <button
        className="cursor-pointer"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            props.reset();
            props.endEditing();
          }, 300);
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}
