"use client";

import { memo, useEffect, useRef, useState, forwardRef } from "react";
import { EditIcon } from "./edit-icon";
import { CancelIcon } from "./cancel-icon";
import { useColumnContext, useRowContext } from "./sheet/providers";
import { useFocusContext } from "./edit/provider";

type TPropsCell = {
  rowNumber: number;
  colNumber: number;
  columnKey: string;
  children: string | number;
};

const CellInput = forwardRef(function CI(
  props: {
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    reset: () => void;
    endEditing: () => void;
  },
  ref: React.ForwardedRef<HTMLInputElement>
) {
  return (
    <div className="flex justify-between gap-1 w-full items-center">
      <input
        ref={ref}
        className="w-full py-1 px-2"
        type="text"
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) => {
          e.preventDefault();
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            props.reset();
            props.endEditing();
          }
        }}
      />
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          props.reset();
          props.endEditing();
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
});

function StringCellInput(props: {
  currentRef: React.ForwardedRef<HTMLInputElement>;
  columnKey: string;
  setOccurredOnCellBlur: () => void;
}) {
  const col = useColumnContext(props.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const [value, setValue] = useState(row[props.columnKey] as string);

  if (!col.editable || col.type !== "string") {
    throw new Error("Invalid condition");
  }

  const validate = () => {
    if (col.constraints?.maxLength) {
      if (value.length > col.constraints.maxLength) {
        alert(
          `最大文字数(${col.constraints.maxLength})を超過しています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (col.constraints?.minLength) {
      if (value.length < col.constraints.minLength) {
        alert(
          `最小文字数(${col.constraints.minLength})を下回っています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (col.constraints?.pattern) {
      if (!new RegExp(col.constraints.pattern).test(value)) {
        alert(`パターンに一致しません。(パターン${col.constraints.pattern})`);
        return false;
      }
    }
    return true;
  };

  return (
    <CellInput
      ref={props.currentRef}
      value={value}
      onChange={(e) => {
        e.preventDefault();
        setValue(e.target.value);
      }}
      onBlur={(e) => {
        e.preventDefault();

        if (value === row[props.columnKey]) {
          finishEditing();
          return;
        }

        if (!validate()) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        col.onCellBlur(props.columnKey, value, row, finishEditing);

        props.setOccurredOnCellBlur();
      }}
      reset={() => setValue(row[props.columnKey])}
      endEditing={finishEditing}
    />
  );
}

function NumberCellInput(props: {
  currentRef: React.ForwardedRef<HTMLInputElement>;
  columnKey: string;
  setOccurredOnCellBlur: () => void;
}) {
  const col = useColumnContext(props.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const [value, setValue] = useState(
    (row[props.columnKey] as number).toString()
  );

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
      ref={props.currentRef}
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

        if (Number(value) === row[props.columnKey]) {
          finishEditing();
          return;
        }

        if (!validate()) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        col.onCellBlur(props.columnKey, Number(value), row, finishEditing);

        props.setOccurredOnCellBlur();
      }}
      reset={() => setValue((row[props.columnKey] as number).toString())}
      endEditing={finishEditing}
    />
  );
}

function SelectCellInput(props: {
  currentRef: React.ForwardedRef<HTMLSelectElement>;
  columnKey: string;
  setOccurredOnCellBlur: () => void;
}) {
  const col = useColumnContext(props.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const [value, setValue] = useState(row[props.columnKey] as string);

  if (!col.editable || col.type !== "select") {
    throw new Error("Invalid condition");
  }

  return (
    <div className="flex justify-between gap-1 w-full items-center">
      <select
        ref={props.currentRef}
        className="w-full py-1 px-2"
        value={value}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onBlur={(e) => {
          e.preventDefault();

          if (value === row[props.columnKey]) {
            finishEditing();
            return;
          }

          col.onCellBlur(props.columnKey, value, row, finishEditing);

          props.setOccurredOnCellBlur();
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
            setValue(row[props.columnKey] as string);
            finishEditing();
          }
        }}
      >
        {col.allowEmpty && (
          <option key="TEPPEN/ReactUI Empty Option" value="">
            {row[props.columnKey] == "" ? "-- 未選択 --" : "-- 選択解除 --"}
          </option>
        )}
        {col.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setValue(row[props.columnKey] as string);
          finishEditing();
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}

function _TableCell(props: TPropsCell) {
  const col = useColumnContext(props.columnKey);
  const { isEditing, checkFocus, focus, focusAndEdit, finishEditing } =
    useFocusContext();
  const ref = useRef<HTMLElement>(null);
  const [occurredOnCellBlur, setOccurredOnCellBlur] = useState(false);

  const isFocus = checkFocus(props.rowNumber, props.colNumber);

  useEffect(() => {
    if (isFocus && isEditing) {
      ref.current?.focus();
    }
    setOccurredOnCellBlur(false);
  }, [isFocus, isEditing, occurredOnCellBlur]);

  useEffect(() => {
    if (!col.editable && isFocus && isEditing) {
      finishEditing();
    }
  }, [isFocus, isEditing, finishEditing]);

  return (
    <td
      className={`${
        isFocus ? "outline outline-1 -outline-offset-1 outline-gray-400" : ""
      }`}
    >
      <div className={`relative`}>
        <div
          className={`flex items-center gap-3 w-fit p-2 cursor-default ${
            isFocus && isEditing ? "opacity-0" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            focus(props.rowNumber, props.colNumber);
          }}
        >
          {col.type === "component" ? (
            props.children
          ) : (
            <div
              onDoubleClick={(e) => {
                e.preventDefault();
                if (col.editable) {
                  focusAndEdit(props.rowNumber, props.colNumber);
                }
              }}
            >
              <p className="text-left">
                {col.type === "select"
                  ? col.options.find((op) => op.value === props.children)?.label
                  : props.children}
              </p>
            </div>
          )}

          {col.editable && (
            <button
              className="w-fit h-fit p-1 rounded-full text-gray-500 hover:bg-gray-200"
              onClick={(e) => {
                e.preventDefault();
                focusAndEdit(props.rowNumber, props.colNumber);
              }}
            >
              <EditIcon size={12} />
            </button>
          )}
        </div>
        {col.editable && isFocus && isEditing && (
          <div
            className="absolute top-0 left-0 w-full h-full grid place-items-center z-10 pr-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {col.type === "string" && (
              <StringCellInput
                currentRef={ref as React.RefObject<HTMLInputElement>}
                columnKey={props.columnKey}
                setOccurredOnCellBlur={() => {
                  setOccurredOnCellBlur(true);
                }}
              />
            )}
            {col.type === "number" && (
              <NumberCellInput
                currentRef={ref as React.RefObject<HTMLInputElement>}
                columnKey={props.columnKey}
                setOccurredOnCellBlur={() => {
                  setOccurredOnCellBlur(true);
                }}
              />
            )}
            {col.type === "select" && (
              <SelectCellInput
                currentRef={ref as React.RefObject<HTMLSelectElement>}
                columnKey={props.columnKey}
                setOccurredOnCellBlur={() => {
                  setOccurredOnCellBlur(true);
                }}
              />
            )}
          </div>
        )}
      </div>
    </td>
  );
}
export const TableCell = memo(_TableCell) as typeof _TableCell;
