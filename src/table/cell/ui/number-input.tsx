"use client";

import { useEffect, useState } from "react";
import {
  useColumnContext,
  useColumnValidateContext,
} from "../../sheet/providers";
import { CellInput } from "./base-input";
import { useCellContext } from "../provider";
import { useEditActionContext } from "../../edit/provider";

export function NumberCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const validate = useColumnValidateContext(cell.columnKey);
  const { endEditing } = useEditActionContext();
  const [value, setValue] = useState((cell.value as number).toString());

  if (!col.editable || col.type !== "number") {
    throw new Error("Invalid condition");
  }

  useEffect(() => {
    setValue((cell.value as number).toString());
  }, [cell.value]);

  return (
    <CellInput
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
      reset={() => setValue((cell.value as number).toString())}
      endEditing={endEditing}
    />
  );
}
