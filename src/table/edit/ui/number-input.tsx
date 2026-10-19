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
} from "../../table/type";

type TPropsCellInput = {
  col: TColumnProperty<DataRecord> & TNumberCellEditingCondition<DataRecord>;
  row: DataObject<DataRecord>;
};

// Text that can still become a number while typing, e.g. "", "-", "1.", ".5".
const EDITING_NUMBER_PATTERN = /^-?[0-9]*\.?[0-9]*$/;

// Converts full-width digits and signs (typed with a Japanese IME) to ASCII.
function toHalfWidth(text: string) {
  return text
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/[．。]/g, ".")
    .replace(/[－ー−]/g, "-");
}

// Turns in-progress text into a complete number string: "" and "-" become
// "0", ".5" becomes "0.5" and "3." becomes "3".
function normalizeNumberText(text: string) {
  const negative = text.startsWith("-");
  let body = negative ? text.slice(1) : text;

  if (body.endsWith(".")) body = body.slice(0, -1);
  if (body.startsWith(".")) body = `0${body}`;
  if (body === "") return "0";

  return negative ? `-${body}` : body;
}

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

        const next = toHalfWidth(e.target.value);

        // Keep the raw text while typing so values like "1.0" or "-" are not
        // collapsed before the user finishes. It becomes a number on blur.
        if (!EDITING_NUMBER_PATTERN.test(next)) {
          return;
        }

        setValue(next);
      }}
      onBlur={(e) => {
        e.preventDefault();

        const normalized = normalizeNumberText(value);

        if (Number(normalized) === prevValue) {
          endEditing();
          return;
        }

        if (!validate(normalized)) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        updateCellValue(normalized);
      }}
      reset={() => setValue(prevValue.toString())}
      endEditing={endEditing}
    />
  );
}
