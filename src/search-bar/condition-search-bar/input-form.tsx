"use client";

import { useEffect, useRef, useState } from "react";
import { Options, SelectBox } from "../../select-box";
import {
  useConditionInputAction,
  useConditionInputState,
} from "./condition-input-management";
import { useIdGenerator } from "../id-generator";
import { TiDeleteOutline } from "react-icons/ti";
import { parseNumberText } from "../../share/text/normalize";
import { isComposingKey } from "../../table/operation/event-target";
import { useMessages } from "../../table/locale/provider";

export function SearchBarInputForm(props: {
  size?: "small" | "medium" | "large";
}) {
  const { status } = useConditionInputState();

  switch (status) {
    case "waiting for input":
      return <TargetInputForm />;
    case "inputted target":
      return <OperatorInputForm />;
    case "inputted operator":
      return <SearchValueInputForm size={props.size} />;
  }
}

function TargetInputForm() {
  const messages = useMessages();
  const { generateId } = useIdGenerator();
  const { targets } = useConditionInputState();
  const { inputTarget } = useConditionInputAction();

  return (
    <SelectBox
      id={generateId("TargetInput")}
      onSelect={(value) => {
        inputTarget(value);
      }}
      options={targets.map((t) => ({
        value: t.key,
        label: t.label,
      }))}
      placeholder={messages.search.selectColumn}
      no_appearance
      no_icon
    />
  );
}

function OperatorInputForm() {
  const messages = useMessages();
  const { generateId } = useIdGenerator();
  const state = useConditionInputState();
  const { inputOperator, removeInputedTarget } = useConditionInputAction();

  if (state.status !== "inputted target") {
    return null;
  }

  const target = state.inputtingCondition.target;
  const operators = state.useableOperators;

  return (
    <>
      <FixedValue
        label={target.label}
        onClickDelete={() => {
          removeInputedTarget();
        }}
      />
      <div className="w-full min-w-64">
        <SelectBox
          id={generateId("OperatorInput")}
          onSelect={(value) => {
            inputOperator(value);

            setTimeout(() => {
              const element = document.getElementById(generateId("ValueInput"));

              if (element) {
                element.focus();
              }
            }, 10);
          }}
          options={operators.map((t) => ({
            value: t.key,
            label: messages.search.operator(t.key),
          }))}
          defaultIsOpen
          placeholder={messages.search.selectCondition}
          no_appearance
          no_icon
        />
      </div>
    </>
  );
}

function SearchValueInputForm(props: { size?: "small" | "medium" | "large" }) {
  const messages = useMessages();
  const state = useConditionInputState();
  const { removeInputedOperator, removeInputedTarget } =
    useConditionInputAction();

  if (state.status !== "inputted operator") {
    return null;
  }

  const target = state.inputtingCondition.target;
  const operator = state.inputtingCondition.operator;

  return (
    <>
      <FixedValue
        label={target.label}
        onClickDelete={() => {
          removeInputedTarget();
        }}
      />
      <FixedValue
        label={messages.search.operator(operator.key)}
        onClickDelete={() => {
          removeInputedOperator();
        }}
      />
      {state.inputtingCondition.operator.inputType === "single string" ? (
        <InputSingleString
          inputType={state.inputtingCondition.operator.inputType}
          size={props.size}
        />
      ) : state.inputtingCondition.operator.inputType === "single number" ? (
        <InputSingleNumber
          inputType={state.inputtingCondition.operator.inputType}
          size={props.size}
        />
      ) : state.inputtingCondition.operator.inputType === "select" ? (
        <InputSingleSelect
          inputType={state.inputtingCondition.operator.inputType}
          options={
            state.inputtingCondition.target.type === "select"
              ? state.inputtingCondition.target.options
              : []
          }
        />
      ) : state.inputtingCondition.operator.inputType === "multi select" ? (
        <InputMultiSelect
          inputType={state.inputtingCondition.operator.inputType}
          options={
            state.inputtingCondition.target.type === "select"
              ? state.inputtingCondition.target.options
              : []
          }
        />
      ) : state.inputtingCondition.operator.inputType === "single datetime" ? (
        <InputSingleDatetime
          inputType={state.inputtingCondition.operator.inputType}
          size={props.size}
        />
      ) : state.inputtingCondition.operator.inputType === "single date" ? (
        <InputSingleDate
          inputType={state.inputtingCondition.operator.inputType}
          size={props.size}
        />
      ) : (
        console.error("Not implemented")
      )}
    </>
  );
}

function InputSingleString(props: {
  inputType: "single string";
  size?: "small" | "medium" | "large";
}) {
  const messages = useMessages();
  const { generateId } = useIdGenerator();
  const [value, setValue] = useState("");
  const { inputValue } = useConditionInputAction();

  return (
    <input
      id={generateId("ValueInput")}
      className={`appearance-none w-full min-w-64 border-none px-2 py-1 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none bg-transparent ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
      type="text"
      placeholder={messages.search.enterValue}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      // 文字列が確定し、Enterキーが押されたら値を入力する
      // (The Enter that confirms IME conversion is ignored.)
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isComposingKey(e.nativeEvent)) {
          inputValue({
            type: props.inputType,
            payload: {
              value: value,
            },
          });
          setValue("");
        }
      }}
    />
  );
}

function InputSingleNumber(props: {
  inputType: "single number";
  size?: "small" | "medium" | "large";
}) {
  const messages = useMessages();
  const { generateId } = useIdGenerator();
  const [value, setValue] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const { inputValue } = useConditionInputAction();

  return (
    <input
      id={generateId("ValueInput")}
      aria-invalid={isInvalid}
      className={`appearance-none w-full min-w-64 border-none px-2 py-1 placeholder:text-gray-400 focus:outline-none focus-visible:outline-none bg-transparent ${
        isInvalid ? "text-red-600 underline decoration-wavy" : ""
      } ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
      type="text"
      placeholder={messages.search.enterValue}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        setIsInvalid(false);
      }}
      // 文字列が確定し、Enterキーが押されたら値を入力する
      onKeyDown={(e) => {
        if (e.key === "Enter" && !isComposingKey(e.nativeEvent)) {
          // Do not add a condition for text that is not a number; before,
          // "" became 0 and other text NaN, which matched nothing.
          const number = parseNumberText(value);
          if (number === null) {
            setIsInvalid(true);
            return;
          }

          inputValue({
            type: props.inputType,
            payload: {
              value: number,
            },
          });
          setValue("");
        }
      }}
    />
  );
}

function InputSingleSelect(props: { inputType: "select"; options: Options[] }) {
  const messages = useMessages();
  const { inputValue } = useConditionInputAction();
  const { generateId } = useIdGenerator();

  return (
    <div className="w-full min-w-64">
      <SelectBox
        id={generateId("ValueInput")}
        onSelect={(value) => {
          inputValue({
            type: props.inputType,
            payload: {
              value: value,
            },
          });
        }}
        options={props.options}
        defaultIsOpen
        placeholder={messages.search.selectValue}
        no_appearance
        no_icon
      />
    </div>
  );
}

function InputMultiSelect(props: {
  inputType: "multi select";
  options: Options[];
}) {
  const messages = useMessages();
  const { inputValue } = useConditionInputAction();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (value: string) => {
    setSelected((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  };

  return (
    <div className="flex items-center gap-1 w-full min-w-64" role="group">
      {props.options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            className={`shrink-0 px-2 rounded border whitespace-nowrap cursor-pointer ${
              isSelected
                ? "bg-[color:var(--teppen-table-accent,#0284c7)] border-[color:var(--teppen-table-accent,#0284c7)] text-[color:var(--teppen-table-accent-text,#ffffff)]"
                : "bg-[color:var(--teppen-table-bg,#ffffff)] border-[color:var(--teppen-table-control-border,#d1d5db)] hover:bg-[color:var(--teppen-table-hover,#f3f4f6)]"
            }`}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        );
      })}
      <button
        type="button"
        disabled={selected.length === 0}
        className="shrink-0 px-2 rounded bg-[color:var(--teppen-table-button-bg,#334155)] text-[color:var(--teppen-table-button-text,#ffffff)] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-default"
        onClick={() =>
          inputValue({
            type: props.inputType,
            // In the order of the options, not the order they were clicked.
            payload: {
              value: props.options
                .map((option) => option.value)
                .filter((value) => selected.includes(value)),
            },
          })
        }
      >
        {messages.search.add}
      </button>
    </div>
  );
}

function InputSingleDatetime(props: {
  inputType: "single datetime";
  size?: "small" | "medium" | "large";
}) {
  const { generateId } = useIdGenerator();
  const { inputValue } = useConditionInputAction();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;

      element.focus();
      element.scrollIntoView();
      element.click();
    }
  }, []);

  return (
    <input
      ref={ref}
      id={generateId("ValueInput")}
      className={`appearance-none w-fit min-w-64 border-none px-2 py-1 focus:outline-none focus-visible:outline-none bg-transparent ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
      type="datetime-local"
      defaultValue={new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16)}
      // Enterキーが押されたら値を入力する
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const value = new Date(ref.current?.value ?? "");

          if (isNaN(value.getTime())) {
            return;
          }

          inputValue({
            type: props.inputType,
            payload: {
              value,
            },
          });
        }
      }}
      onClick={(e) => {
        e.currentTarget.showPicker();
      }}
    />
  );
}

function InputSingleDate(props: {
  inputType: "single date";
  size?: "small" | "medium" | "large";
}) {
  const { generateId } = useIdGenerator();
  const { inputValue } = useConditionInputAction();
  const ref = useRef<HTMLInputElement>(null);
  const isClicked = useRef(false);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;

      element.focus();
      element.scrollIntoView();
      element.click();
    }
  }, []);

  return (
    <input
      ref={ref}
      id={generateId("ValueInput")}
      className={`appearance-none w-fit min-w-64 border-none px-2 py-1 focus:outline-none focus-visible:outline-none bg-transparent ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
      type="date"
      defaultValue={new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 10)}
      // Enterキーが押されたら値を入力する
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (!ref.current?.value) {
            return;
          }

          const [year, month, date] = ref.current.value.split("-");
          const value = new Date(Number(year), Number(month) - 1, Number(date));

          if (isNaN(value.getTime())) {
            return;
          }

          inputValue({
            type: props.inputType,
            payload: {
              value,
            },
          });
        }
      }}
      onClick={(e) => {
        if (isClicked.current) {
          return;
        }

        e.currentTarget.showPicker();
        isClicked.current = true;
      }}
    />
  );
}

function FixedValue(props: { label: string; onClickDelete?: () => void }) {
  return (
    <div className="flex items-center gap-2 w-fit px-2 border border-[color:var(--teppen-table-border,#e5e7eb)] rounded bg-[color:var(--teppen-table-active,#f1f5f9)]">
      <p className="whitespace-nowrap">{props.label}</p>
      {props.onClickDelete && (
        <div>
          <TiDeleteOutline
            className="bg-[color:var(--teppen-table-bg,#ffffff)] hover:bg-[color:var(--teppen-table-hover,#cbd5e1)] rounded-full cursor-pointer"
            onClick={props.onClickDelete}
          />
        </div>
      )}
    </div>
  );
}
