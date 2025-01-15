"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditActionContext } from "../provider";
import { CancelIcon } from "../../../icon/cancel-icon";
import {
  DataObject,
  DataRecord,
  TColumnProperty,
  TSelectCellEditingCondition,
} from "../../table/type";
import { SelectBox } from "../../../select-box";
import { useTableIdGenerator } from "../../id";

type TPropsCellInput = {
  col: TColumnProperty<DataRecord> & TSelectCellEditingCondition<DataRecord>;
  row: DataObject<DataRecord>;
};

export function SelectCellInput(props: TPropsCellInput) {
  const IdGenerator = useTableIdGenerator();
  const col = props.col;
  const { endEditing } = useEditActionContext();
  const prevValue = props.row[col.key] as string;
  const [value, setValue] = useState(prevValue);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const updateCellValue = (value: string) => {
    if (col.editable) {
      col.onCellBlur(col.key, value, props.row, endEditing);
    }
  };

  if (!col.editable) return <></>;

  useEffect(() => {
    const onClickOutOfSelectBox = (e: MouseEvent) => {
      const selectInputElement = ref.current;
      const ele = e.target;

      if (ele instanceof Node && selectInputElement?.contains(ele)) return;

      if (value === prevValue) {
        endEditing();
        return;
      }

      updateCellValue(value);
    };

    document.addEventListener("mousedown", onClickOutOfSelectBox);

    return () => {
      document.removeEventListener("mousedown", onClickOutOfSelectBox);
    };
  }, [value, updateCellValue, endEditing, prevValue]);

  const options = useMemo(() => {
    if (col.allowEmpty) {
      return [
        {
          value: "",
          label: prevValue === "" ? "-- 未選択 --" : "-- 選択解除 --",
        },
        ...col.options,
      ];
    } else {
      return col.options;
    }
  }, [col.options, col.allowEmpty, prevValue]);

  return (
    <div ref={ref} className="flex justify-between gap-1 w-full items-center">
      <SelectBox
        id={IdGenerator.getEditorId()}
        inputRef={inputRef}
        value={value}
        defaultIsOpen={true}
        options={options}
        onSelect={(value) => {
          setValue(value);
          updateCellValue(value);
        }}
      />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            setValue(prevValue);
            endEditing();
          }, 300);
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}
