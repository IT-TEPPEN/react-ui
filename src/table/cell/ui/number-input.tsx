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

export function NumberCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const { ref, callbackAfterBlur } = useCellFocus<HTMLInputElement>();
  const [value, setValue] = useState((cell.value as number).toString());

  if (!col.editable || col.type !== "number") {
    throw new Error("Invalid condition");
  }

  const validate = () => {
    const v = parseInt(value);

    if (col.constraints?.max) {
      if (v > col.constraints.max) {
        alert(`最大値(${col.constraints.max})を超過しています。(入力値:${v})`);
        return false;
      }
    }

    if (col.constraints?.min) {
      if (v < col.constraints.min) {
        alert(`最小値(${col.constraints.min})を下回っています。(入力値:${v})`);
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

        if (e.target.value === "") {
          setValue("0");
          return;
        }

        if (e.target.value === "-" || e.target.value === "0-") {
          setValue("-0");
          return;
        }

        if (e.target.value.match(/^-?[0-9]+\.$/)) {
          setValue(e.target.value);
          return;
        }

        if (isNaN(Number(e.target.value))) {
          return;
        }

        setValue(Number(e.target.value).toString());
      }}
      onBlur={(e) => {
        e.preventDefault();

        if (Number(value) === cell.value) {
          finishEditing();
          return;
        }

        if (!validate()) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        col.onCellBlur(cell.columnKey, Number(value), row, finishEditing);

        callbackAfterBlur();
      }}
      reset={() => setValue((cell.value as number).toString())}
      endEditing={finishEditing}
    />
  );
}
