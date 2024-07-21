"use client";

import { useState } from "react";
import { useFocusContext } from "../../edit/provider";
import { useCellFocus } from "../../hook";
import {
  useCellContext,
  useColumnContext,
  useRowContext,
} from "../../sheet/providers";
import { CancelIcon } from "../../cancel-icon";

export function SelectCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const { ref, callbackAfterBlur } = useCellFocus<HTMLSelectElement>();
  const [value, setValue] = useState(cell.value as string);

  if (!col.editable || col.type !== "select") {
    throw new Error("Invalid condition");
  }

  return (
    <div className="flex justify-between gap-1 w-full items-center">
      <select
        ref={ref}
        className="w-full py-1 px-2 bg-white text-gray-900"
        value={value}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onBlur={(e) => {
          e.preventDefault();

          if (value === cell.value) {
            finishEditing();
            return;
          }

          col.onCellBlur(cell.columnKey, value, row, finishEditing);

          callbackAfterBlur();
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLSelectElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        onKeyUp={(e: React.KeyboardEvent<HTMLSelectElement>) => {
          e.preventDefault();
          if (e.key === "Enter") {
            (e.target as HTMLSelectElement).blur();
          } else if (e.key === "Escape") {
            setValue(cell.value as string);
            finishEditing();
          }
        }}
      >
        {col.allowEmpty && (
          <option key="TEPPEN/ReactUI Empty Option" value="">
            {cell.value == "" ? "-- 未選択 --" : "-- 選択解除 --"}
          </option>
        )}
        {col.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setValue(cell.value as string);
          finishEditing();
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}
