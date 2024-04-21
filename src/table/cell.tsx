"use client";

import { memo, useState, forwardRef } from "react";
import { EditIcon } from "./edit-icon";
import { CancelIcon } from "./cancel-icon";
import {
  useCellContext,
  useColumnContext,
  useRowContext,
} from "./sheet/providers";
import { useFocusContext } from "./edit/provider";
import { useCell, useCellFocus } from "./hook";

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
        className="w-full py-1 px-2 bg-white text-gray-900"
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

function StringCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const { ref, callbackAfterBlur } = useCellFocus<HTMLInputElement>();
  const [value, setValue] = useState(row[cell.columnKey] as string);

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
      ref={ref}
      value={value}
      onChange={(e) => {
        e.preventDefault();
        setValue(e.target.value);
      }}
      onBlur={(e) => {
        e.preventDefault();

        if (value === row[cell.columnKey]) {
          finishEditing();
          return;
        }

        if (!validate()) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        col.onCellBlur(cell.columnKey, value, row, finishEditing);

        callbackAfterBlur();
      }}
      reset={() => setValue(row[cell.columnKey].toString())}
      endEditing={finishEditing}
    />
  );
}

function NumberCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const { ref, callbackAfterBlur } = useCellFocus<HTMLInputElement>();
  const [value, setValue] = useState((cell.value as number).toString());

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
      ref={ref}
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
          finishEditing();
          return;
        }

        if (!validate()) {
          setTimeout(() => {
            e.target.focus();
          }, 100);
          return;
        }

        col.onCellBlur(cell.columnKey, Number(value), row, finishEditing);

        callbackAfterBlur();
      }}
      reset={() => setValue((cell.value as number).toString())}
      endEditing={finishEditing}
    />
  );
}

function SelectCellInput() {
  const cell = useCellContext();
  const col = useColumnContext(cell.columnKey);
  const row = useRowContext();
  const { finishEditing } = useFocusContext();
  const { ref, callbackAfterBlur } = useCellFocus<HTMLSelectElement>();
  const [value, setValue] = useState(cell.value as string);

  if (!col.editable || col.type !== "select") {
    throw new Error("Invalid condition");
  }

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

          if (value === cell.value) {
            finishEditing();
            return;
          }

          col.onCellBlur(cell.columnKey, value, row, finishEditing);

          callbackAfterBlur();
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
            setValue(cell.value as string);
            finishEditing();
          }
        }}
      >
        {col.allowEmpty && (
          <option key="TEPPEN/ReactUI Empty Option" value="">
            {cell.value == "" ? "-- 未選択 --" : "-- 選択解除 --"}
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
          setValue(cell.value as string);
          finishEditing();
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
}

const EditButton = memo(function EB() {
  const cell = useCellContext();
  const { focusAndEdit } = useFocusContext();

  return (
    <button
      className="w-fit h-fit p-1 rounded-full text-gray-500 hover:bg-gray-200"
      onClick={(e) => {
        e.preventDefault();
        focusAndEdit(cell.rowIndex, cell.colIndex);
      }}
    >
      <EditIcon size={12} />
    </button>
  );
});

export function TableCell() {
  const {
    cell,
    isFocus,
    isEditing,
    onClickCellToFocus,
    onDoubleClickCellToEdit,
    preventPropagation,
  } = useCell();
  const row = useRowContext();

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
          onClick={onClickCellToFocus}
        >
          {!!cell.render ? (
            cell.render(cell.value, row)
          ) : (
            <div onDoubleClick={onDoubleClickCellToEdit}>
              <p className="text-left">{cell.label}</p>
            </div>
          )}

          {cell.editable && <EditButton />}
        </div>

        {cell.editable && isFocus && isEditing && (
          <div
            className="absolute top-0 left-0 w-full h-full grid place-items-center z-10 pr-2"
            onClick={preventPropagation}
          >
            {cell.type === "string" && <StringCellInput />}
            {cell.type === "number" && <NumberCellInput />}
            {cell.type === "select" && <SelectCellInput />}
          </div>
        )}
      </div>
    </td>
  );
}
