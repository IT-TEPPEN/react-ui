import {
  memo,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useCallback,
} from "react";
import { DataObject, TCellEditingCondition } from "./type";
import { EditIcon } from "./edit-icon";
import { CancelIcon } from "./cancel-icon";

type TPropsCell = {
  currentRecord: DataObject;
  columnKey: string;
  children: string | number;
} & TCellEditingCondition;

const CellInput = forwardRef(function CI<T extends string | number>(
  props: {
    value: T;
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

const StringCellInput = forwardRef(function SI(
  props: {
    columnKey: string;
    currentRecord: DataObject;
    compEditing: () => void;
    onCellBlur: (
      key: string,
      value: string,
      current: DataObject,
      completeEditing: () => void
    ) => void;
    constraints?: { maxLength?: number; minLength?: number; pattern?: string };
  },
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [value, setValue] = useState(
    props.currentRecord[props.columnKey] as string
  );

  const validate = () => {
    if (props.constraints?.maxLength) {
      if (value.length > props.constraints.maxLength) {
        alert(
          `最大文字数(${props.constraints.maxLength})を超過しています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (props.constraints?.minLength) {
      if (value.length < props.constraints.minLength) {
        alert(
          `最小文字数(${props.constraints.minLength})を下回っています。(現在${value.length}文字)`
        );
        return false;
      }
    }
    if (props.constraints?.pattern) {
      if (!new RegExp(props.constraints.pattern).test(value)) {
        alert(`パターンに一致しません。(パターン${props.constraints.pattern})`);
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

        if (value === props.currentRecord[props.columnKey]) {
          props.compEditing();
          return;
        }

        if (props.onCellBlur) {
          if (!validate()) {
            setTimeout(() => {
              e.target.focus();
            }, 100);
            return;
          }

          props.onCellBlur(
            props.columnKey,
            value,
            props.currentRecord,
            props.compEditing
          );
        } else {
          setValue(props.currentRecord[props.columnKey]);
          props.compEditing();
        }
      }}
      reset={() => setValue(props.currentRecord[props.columnKey])}
      endEditing={props.compEditing}
    />
  );
});

const NumberCellInput = forwardRef(function SI(
  props: {
    columnKey: string;
    currentRecord: DataObject;
    compEditing: () => void;
    onCellBlur: (
      key: string,
      value: number,
      current: DataObject,
      completeEditing: () => void
    ) => void;
    constraints?: { max?: number; min?: number };
  },
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [value, setValue] = useState(
    (props.currentRecord[props.columnKey] as number).toString()
  );

  const validate = () => {
    const v = parseInt(value);

    if (props.constraints?.max) {
      if (v > props.constraints.max) {
        alert(
          `最大値(${props.constraints.max})を超過しています。(入力値:${v})`
        );
        return false;
      }
    }

    if (props.constraints?.min) {
      if (v < props.constraints.min) {
        alert(
          `最小値(${props.constraints.min})を下回っています。(入力値:${v})`
        );
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

        if (Number(value) === props.currentRecord[props.columnKey]) {
          props.compEditing();
          return;
        }

        if (props.onCellBlur) {
          if (!validate()) {
            setTimeout(() => {
              e.target.focus();
            }, 100);
            return;
          }

          props.onCellBlur(
            props.columnKey,
            Number(value),
            props.currentRecord,
            props.compEditing
          );
        } else {
          setValue((props.currentRecord[props.columnKey] as number).toString());
          props.compEditing();
        }
      }}
      reset={() =>
        setValue((props.currentRecord[props.columnKey] as number).toString())
      }
      endEditing={props.compEditing}
    />
  );
});

const SelectCellInput = forwardRef(function SI(
  props: {
    columnKey: string;
    currentRecord: DataObject;
    compEditing: () => void;
    options: { value: string; label: string }[];
    allowEmpty?: boolean;
    onCellBlur: (
      key: string,
      value: string,
      current: DataObject,
      completeEditing: () => void
    ) => void;
  },
  ref: React.ForwardedRef<HTMLSelectElement>
) {
  const [value, setValue] = useState(
    props.currentRecord[props.columnKey] as string
  );

  return (
    <div className="flex justify-between gap-1 w-full items-center">
      <select
        ref={ref}
        className="w-full py-1 px-2"
        value={value}
        onChange={(e) => {
          e.preventDefault();
          setValue(e.target.value);
        }}
        onBlur={(e) => {
          e.preventDefault();

          if (props.onCellBlur) {
            props.onCellBlur(
              props.columnKey,
              value,
              props.currentRecord,
              props.compEditing
            );
          } else {
            setValue(props.currentRecord[props.columnKey] as string);
            props.compEditing();
          }
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
            setValue(props.currentRecord[props.columnKey] as string);
            props.compEditing();
          }
        }}
      >
        {props.allowEmpty && (
          <option key="TEPPEN/ReactUI Empty Option" value="">
            {props.currentRecord[props.columnKey] == ""
              ? "-- 未選択 --"
              : "-- 選択解除 --"}
          </option>
        )}
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setValue(props.currentRecord[props.columnKey] as string);
          props.compEditing();
        }}
      >
        <CancelIcon size={16} />
      </button>
    </div>
  );
});

export const TableCell = memo(function TC(props: TPropsCell) {
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const compEditing = useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  useEffect(() => {
    if (isEditing) {
      ref.current?.focus();
    }
  }, [isEditing]);

  return (
    <td>
      <div className="relative">
        <div
          className={`flex items-center gap-3 w-fit p-2 cursor-default ${
            isEditing ? "opacity-0" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div
            onDoubleClick={(e) => {
              e.preventDefault();
              if (props.editable) {
                setIsEditing(true);
              }
            }}
          >
            <p className="text-left">
              {props.type === "select"
                ? props.options.find((op) => op.value === props.children)?.label
                : props.children}
            </p>
          </div>
          {props.editable && (
            <button
              className="w-fit h-fit p-1 rounded-full text-gray-500 hover:bg-gray-200"
              onClick={(e) => {
                e.preventDefault();
                if (props.editable) {
                  setIsEditing(true);
                }
              }}
            >
              <EditIcon size={12} />
            </button>
          )}
        </div>
        {props.editable && isEditing && (
          <div
            className="absolute top-0 left-0 w-full h-full grid place-items-center z-10 pr-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {props.type === "string" && (
              <StringCellInput
                ref={ref as React.RefObject<HTMLInputElement>}
                columnKey={props.columnKey}
                currentRecord={props.currentRecord}
                compEditing={compEditing}
                onCellBlur={props.onCellBlur}
                constraints={props.constraints}
              />
            )}
            {props.type === "number" && (
              <NumberCellInput
                ref={ref as React.RefObject<HTMLInputElement>}
                columnKey={props.columnKey}
                currentRecord={props.currentRecord}
                compEditing={compEditing}
                onCellBlur={props.onCellBlur}
                constraints={props.constraints}
              />
            )}
            {props.type === "select" && (
              <SelectCellInput
                ref={ref as React.RefObject<HTMLSelectElement>}
                columnKey={props.columnKey}
                currentRecord={props.currentRecord}
                compEditing={compEditing}
                options={props.options}
                allowEmpty={props.allowEmpty}
                onCellBlur={props.onCellBlur}
              />
            )}
          </div>
        )}
      </div>
    </td>
  );
});
