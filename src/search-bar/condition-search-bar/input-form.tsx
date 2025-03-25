"use client";

import { useEffect, useRef, useState } from "react";
import { Options, SelectBox } from "../../select-box";
import {
  useConditionInputAction,
  useConditionInputState,
} from "./condition-input-management";
import { useIdGenerator } from "../id-generator";
import { TiDeleteOutline } from "react-icons/ti";

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
      placeholder="Select target"
      no_appearance
      no_icon
    />
  );
}

function OperatorInputForm() {
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
            label: t.label,
          }))}
          defaultIsOpen
          placeholder="Select operator"
          no_appearance
          no_icon
        />
      </div>
    </>
  );
}

function SearchValueInputForm(props: { size?: "small" | "medium" | "large" }) {
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
        label={operator.label}
        onClickDelete={() => {
          removeInputedOperator();
        }}
      />
      {state.inputtingCondition.operator.inputType === "single string" ? (
        <InputSingleString inputType="single string" size={props.size} />
      ) : state.inputtingCondition.operator.inputType === "single number" ? (
        <InputSingleNumber inputType="single number" size={props.size} />
      ) : state.inputtingCondition.operator.inputType === "select" ? (
        <InputSingleSelect
          inputType="select"
          options={
            state.inputtingCondition.target.type === "select"
              ? state.inputtingCondition.target.options
              : []
          }
        />
      ) : state.inputtingCondition.operator.inputType === "single datetime" ? (
        <InputSingleDatetime inputType="single datetime" size={props.size} />
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
  const { generateId } = useIdGenerator();
  const [value, setValue] = useState("");
  const { inputValue } = useConditionInputAction();

  return (
    <input
      id={generateId("ValueInput")}
      className={`appearance-none w-full min-w-64 border-none px-2 py-1 focus:outline-none focus-visible:outline-none bg-transparent ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
      type="text"
      placeholder="Search text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      // 文字列が確定し、Enterキーが押されたら値を入力する
      onKeyDown={(e) => {
        if (e.key === "Enter") {
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
  const { generateId } = useIdGenerator();
  const [value, setValue] = useState("");
  const { inputValue } = useConditionInputAction();

  return (
    <input
      id={generateId("ValueInput")}
      className={`appearance-none w-full min-w-64 border-none px-2 py-1 focus:outline-none focus-visible:outline-none bg-transparent ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
      type="text"
      placeholder="Search text"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      // 文字列が確定し、Enterキーが押されたら値を入力する
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          inputValue({
            type: props.inputType,
            payload: {
              value: Number(value),
            },
          });
          setValue("");
        }
      }}
    />
  );
}

function InputSingleSelect(props: { inputType: "select"; options: Options[] }) {
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
        placeholder="Select value"
        no_appearance
        no_icon
      />
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
      placeholder="Select datetime"
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

function FixedValue(props: { label: string; onClickDelete?: () => void }) {
  return (
    <div className="flex items-center gap-2 w-fit px-2 border rounded bg-slate-100">
      <p className="whitespace-nowrap">{props.label}</p>
      {props.onClickDelete && (
        <div>
          <TiDeleteOutline
            className="bg-white hover:bg-slate-300 rounded-full cursor-pointer"
            onClick={props.onClickDelete}
          />
        </div>
      )}
    </div>
  );
}
