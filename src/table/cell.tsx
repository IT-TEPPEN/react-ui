import {
  memo,
  useEffect,
  useRef,
  useState,
  forwardRef,
  useCallback,
} from "react";
import {
  TCellEditingCondition,
  TNumberCellEditingCondition,
  TStringCellEditingCondition,
} from "./type";
import { EditIcon } from "./edit-icon";
import { CancelIcon } from "./cancel-icon";

type TPropsCell = {
  id: string | number;
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
    id: number | string;
    currentValue: string;
    compEditing: () => void;
  } & TStringCellEditingCondition,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [value, setValue] = useState(props.currentValue);

  const validate = () => {
    if (props.constraints?.maxLength) {
      if (value.length > props.constraints.maxLength) {
        alert("over max length");
        return false;
      }
    }
    if (props.constraints?.minLength) {
      if (value.length < props.constraints.minLength) {
        alert("under min length");
        return false;
      }
    }
    if (props.constraints?.pattern) {
      if (!new RegExp(props.constraints.pattern).test(value)) {
        alert("not match pattern");
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

        if (value === props.currentValue) {
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
            props.id,
            value,
            props.currentValue,
            props.compEditing
          );
        } else {
          setValue(props.currentValue);
          props.compEditing();
        }
      }}
      reset={() => setValue(props.currentValue)}
      endEditing={props.compEditing}
    />
  );
});

const NumberCellInput = forwardRef(function SI(
  props: {
    id: number | string;
    currentValue: number;
    compEditing: () => void;
  } & TNumberCellEditingCondition,
  ref: React.ForwardedRef<HTMLInputElement>
) {
  const [value, setValue] = useState(props.currentValue.toString());

  const validate = () => {
    const v = parseInt(value);

    if (props.constraints?.max) {
      if (v > props.constraints.max) {
        alert("over max");
        return false;
      }
    }

    if (props.constraints?.min) {
      if (v < props.constraints.min) {
        alert("under min");
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

        if (e.target.value === "-") {
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

        setValue(e.target.value);
      }}
      onBlur={(e) => {
        e.preventDefault();

        if (Number(value) === props.currentValue) {
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
            props.id,
            Number(value),
            props.currentValue,
            props.compEditing
          );
        } else {
          setValue(props.currentValue.toString());
          props.compEditing();
        }
      }}
      reset={() => setValue(props.currentValue.toString())}
      endEditing={props.compEditing}
    />
  );
});

export const TableCell = memo(function TC(props: TPropsCell) {
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

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
            <p className="text-left">{props.children}</p>
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
        {isEditing && (
          <div
            className="absolute top-0 left-0 w-full h-full grid place-items-center z-10 pr-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {props.type === "string" && (
              <StringCellInput
                ref={ref}
                id={props.id}
                currentValue={props.children as string}
                compEditing={compEditing}
                type={"string"}
                onCellBlur={props.onCellBlur}
                constraints={props.constraints}
              />
            )}
            {props.type === "number" && (
              <NumberCellInput
                ref={ref}
                id={props.id}
                currentValue={props.children as number}
                compEditing={compEditing}
                type={"number"}
                onCellBlur={props.onCellBlur}
                constraints={props.constraints}
              />
            )}
          </div>
        )}
      </div>
    </td>
  );
});
