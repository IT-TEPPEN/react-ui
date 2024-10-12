"use client";

import { useState } from "react";
import { useColumnValidateContext } from "../../sheet/providers";
import { CellInput } from "./base-input";
import { useEditActionContext } from "../provider";
import {
  DataObject,
  DataRecord,
  TColumnProperty,
  TNumberCellEditingCondition,
} from "../../type";

type TPropsCellInput = {
  col: TColumnProperty<DataRecord> & TNumberCellEditingCondition<DataRecord>;
  row: DataObject<DataRecord>;
};

export function NumberCellInput(props: TPropsCellInput) {
  const col = props.col;
  const validate = useColumnValidateContext(col.key);
  const { endEditing } = useEditActionContext();
  const prevValue = props.row[col.key] as number;
  const [value, setValue] = useState(prevValue.toString());

  const updateCellValue = (value: string) => {
    if (col.editable) {
      col.onCellBlur(col.key, Number(value), props.row, endEditing);
    }
  };

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

        if (Number(value) === prevValue) {
          endEditing();
          return;
        }

        if (!validate(value)) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        updateCellValue(value);
      }}
      reset={() => setValue(prevValue.toString())}
      endEditing={endEditing}
    />
  );
}
