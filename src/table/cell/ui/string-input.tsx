"use client";

import { useState } from "react";
import { useFocusContext } from "../../edit/provider";
import { useCellFocus } from "../../hook";
import {
  useCellContext,
  useColumnContext,
  useRowContext,
} from "../../sheet/providers";
import { CellInput } from "./base-input";

export function StringCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const { ref, callbackAfterBlur } = useCellFocus<HTMLInputElement>();
  const [value, setValue] = useState(row[cell.columnKey] as string);

  if (!col.editable || col.type !== "string") {
    throw new Error("Invalid condition");
  }

  const validate = () => {
    if (col.constraints?.maxLength) {
      if (value.length > col.constraints.maxLength) {
        alert(
          `最大文字数(${col.constraints.maxLength})を超過しています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (col.constraints?.minLength) {
      if (value.length < col.constraints.minLength) {
        alert(
          `最小文字数(${col.constraints.minLength})を下回っています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (col.constraints?.pattern) {
      if (!new RegExp(col.constraints.pattern).test(value)) {
        alert(`パターンに一致しません。(パターン${col.constraints.pattern})`);
        return false;
      }
    }
    return true;
  };

  return (
    <CellInput
      ref={ref}
      value={value}
      onChange={(e) => {
        e.preventDefault();
        setValue(e.target.value);
      }}
      onBlur={(e) => {
        e.preventDefault();

        if (value === row[cell.columnKey]) {
          finishEditing();
          return;
        }

        if (!validate()) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        col.onCellBlur(cell.columnKey, value, row, finishEditing);

        callbackAfterBlur();
      }}
      reset={() => setValue(row[cell.columnKey].toString())}
      endEditing={finishEditing}
    />
  );
}
