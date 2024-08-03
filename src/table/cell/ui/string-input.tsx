"use client";

import { memo, useState } from "react";
import { useEditContext } from "../../edit/provider";
// import { useCellFocus } from "../../hook";
import {
  useColumnContext,
  useColumnValidateContext,
  useRowContext,
} from "../../sheet/providers";
import { CellInput } from "./base-input";
import { useCellContext } from "../provider";

export const StringCellInput = memo(function SCI() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const validate = useColumnValidateContext(cell.columnKey);
  const { endEditing } = useEditContext();
  // const { ref, callbackAfterBlur } = useCellFocus<HTMLInputElement>();
  const [value, setValue] = useState(cell.value as string);

  console.log("StringCellInput");

  if (!col.editable || col.type !== "string") {
    throw new Error("Invalid condition");
  }

  return (
    <CellInput
      // ref={ref}
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

        if (!validate(value)) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        cell.updateCellValue(value);

        // callbackAfterBlur();
      }}
      reset={() => setValue(cell.value.toString())}
      endEditing={endEditing}
    />
  );
});
