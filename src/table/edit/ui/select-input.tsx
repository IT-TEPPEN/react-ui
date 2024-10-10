"use client";

import { useState } from "react";
import { useEditActionContext } from "../provider";
import { CancelIcon } from "../../cancel-icon";
import {
  DataObject,
  DataRecord,
  TColumnProperty,
  TSelectCellEditingCondition,
} from "../../type";

type TPropsCellInput = {
  col: TColumnProperty<DataRecord> & TSelectCellEditingCondition<DataRecord>;
  row: DataObject<DataRecord>;
};

export function SelectCellInput(props: TPropsCellInput) {
  const col = props.col;
  const { endEditing } = useEditActionContext();
  const prevValue = props.row[col.key] as string;
  const [value, setValue] = useState(prevValue);

  const updateCellValue = (value: string) => {
    if (col.editable) {
      col.onCellBlur(col.key, value, props.row, endEditing);
    }
  };

  if (!col.editable) return <></>;

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

          if (value === prevValue) {
            endEditing();
            return;
          }

          updateCellValue(value);
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
            setValue(prevValue as string);
            endEditing();
          }
        }}
      >
        {col.allowEmpty && (
          <option key="TEPPEN/ReactUI Empty Option" value="">
            {prevValue == "" ? "-- 未選択 --" : "-- 選択解除 --"}
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
            setValue(prevValue);
            endEditing();
          }, 300);
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}
