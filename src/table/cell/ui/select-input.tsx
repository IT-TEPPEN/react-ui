"use client";

import { useEffect, useState } from "react";
import { useEditActionContext } from "../../edit/provider";
import { useColumnContext } from "../../sheet/providers";
import { CancelIcon } from "../../cancel-icon";
import { useCellContext } from "../provider";

export function SelectCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const { endEditing } = useEditActionContext();
  const [value, setValue] = useState(cell.value as string);

  if (!col.editable || col.type !== "select") {
    throw new Error("Invalid condition");
  }

  useEffect(() => {
    setValue(cell.value as string);
  }, [cell.value]);

  return (
    <div className="flex justify-between gap-1 w-full items-center">
      <select
        className="w-full py-1 px-2 bg-white text-gray-900"
        value={value}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onBlur={(e) => {
          e.preventDefault();

          if (value === cell.value) {
            endEditing();
            return;
          }

          cell.updateCellValue(value);
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
            endEditing();
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
          e.stopPropagation();
          setTimeout(() => {
            setValue(cell.value as string);
            endEditing();
          }, 300);
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}
