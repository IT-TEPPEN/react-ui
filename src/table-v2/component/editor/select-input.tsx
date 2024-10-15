"use client";

import { useEffect, useRef, useState } from "react";
import { CancelIcon } from "../../../icon/cancel-icon";
import { useForm } from "./hook";

export function SelectCellInput() {
  const props = useForm();
  const [value, setValue] = useState(
    props.type === "select" ? props.prevValue : ""
  );
  const ref = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  if (props.type !== "select") {
    return <></>;
  }

  const { prevValue, updateCellValue, switchToFocusMode, allowEmpty, options } =
    props;

  return (
    <div className="flex justify-between gap-1 w-full items-center">
      <select
        ref={ref}
        className="w-full py-1 px-2 bg-white text-gray-900"
        value={value}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onBlur={(e) => {
          e.preventDefault();

          if (value === prevValue) {
            switchToFocusMode();
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
            switchToFocusMode();
          }
        }}
      >
        {allowEmpty && (
          <option key="TEPPEN/ReactUI Empty Option" value="">
            {prevValue == "" ? "-- 未選択 --" : "-- 選択解除 --"}
          </option>
        )}
        {options.map((option) => (
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
            switchToFocusMode();
          }, 300);
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}
