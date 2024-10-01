"use client";

import { memo, useEffect, useState } from "react";
import { useEditActionContext } from "../../edit/provider";
import {
  useColumnContext,
  useColumnValidateContext,
} from "../../sheet/providers";
import { CellInput } from "./base-input";
import { useCellContext } from "../provider";

export const StringCellInput = memo(function SCI() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const validate = useColumnValidateContext(cell.columnKey);
  const { endEditing } = useEditActionContext();
  const [value, setValue] = useState(cell.value as string);

  if (!col.editable || col.type !== "string") {
    throw new Error("Invalid condition");
  }

  useEffect(() => {
    setValue(cell.value as string);
  }, [cell.value]);

  return (
    <CellInput
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
      }}
      reset={() => setValue(cell.value.toString())}
      endEditing={endEditing}
    />
  );
});
