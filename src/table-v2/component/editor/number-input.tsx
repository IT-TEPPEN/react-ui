"use client";

import { useState } from "react";
import { useColumnValidateContext } from "../../sheet/providers";
import { CellInput } from "./base-input";
import { useForm } from "./hook";

export function NumberCellInput() {
  const props = useForm();
  const validate = useColumnValidateContext(col.key);
  const [value, setValue] = useState(
    props.type === "number" ? props.prevValue.toString() : ""
  );

  if (props.type !== "number") {
    return <></>;
  }

  const { updateCellValue, switchToFocusMode, prevValue } = props;

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
          switchToFocusMode();
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
      endEditing={switchToFocusMode}
    />
  );
}
