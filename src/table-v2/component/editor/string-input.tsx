"use client";

import { useState } from "react";
import { useEditActionContext } from "../provider";
import { useColumnValidateContext } from "../../sheet/providers";
import { CellInput } from "./base-input";
import {
  DataObject,
  DataRecord,
  TColumnProperty,
  TStringCellEditingCondition,
} from "../../table/type";

type TPropsCellInput = {
  col: TColumnProperty<DataRecord> & TStringCellEditingCondition<DataRecord>;
  row: DataObject<DataRecord>;
};

export function StringCellInput(props: TPropsCellInput) {
  const col = props.col;
  const validate = useColumnValidateContext(col.key);
  const { endEditing } = useEditActionContext();
  const prevValue = props.row[col.key] as string;
  const [value, setValue] = useState(prevValue);

  const updateCellValue = (value: string) => {
    if (col.editable) {
      col.onCellBlur(col.key, value, props.row, endEditing);
    }
  };

  return (
    <CellInput
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
