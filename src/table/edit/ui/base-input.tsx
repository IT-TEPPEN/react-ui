"use client";

import { useEffect, useRef } from "react";
import { CancelIcon } from "../../../icon/cancel-icon";
import { useTableIdGenerator } from "../../id";
import { isComposingKey } from "../../operation/event-target";

export function CellInput(props: {
  type?: "text";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  reset: () => void;
  endEditing: () => void;
}) {
  const IdGenerator = useTableIdGenerator();
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
        // Handled on keydown so that keys used by an IME (e.g. Enter to
        // confirm or Escape to cancel Japanese conversion) can be told apart
        // and ignored; on keyup they look like plain Enter / Escape.
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (isComposingKey(e.nativeEvent)) {
            return;
          }

          if (e.key === "Enter") {
            e.preventDefault();
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
