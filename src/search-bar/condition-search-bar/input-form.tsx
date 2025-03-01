"use client";

import { useState } from "react";
import { SelectBox } from "../../select-box";
import {
  useConditionInputAction,
  useConditionInputState,
} from "./condition-input-management";
import { useIdGenerator } from "../id-generator";
import { TiDeleteOutline } from "react-icons/ti";

export function SearchBarInputForm() {
  const { status } = useConditionInputState();

  switch (status) {
    case "waiting for input":
      return <TargetInputForm />;
    case "inputted target":
      return <OperatorInputForm />;
    case "inputted operator":
      return <SearchValueInputForm />;
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
      <SelectBox
        id={generateId("OperatorInput")}
        onSelect={(value) => {
          inputOperator(value);

          setTimeout(() => {
            const element = document.getElementById(
              generateId("OperatorInput")
            );

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
    </>
  );
}

function SearchValueInputForm() {
  const { generateId } = useIdGenerator();
  const state = useConditionInputState();
  const { inputValue, removeInputedOperator, removeInputedTarget } =
    useConditionInputAction();
  const [value, setValue] = useState("");

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
      <input
        id={generateId("OperatorInput")}
        className="no_appearance border-none p-2 focus:outline-none focus-visible:outline-none bg-transparent"
        type="text"
        placeholder="Search text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        // 文字列が確定し、Enterキーが押されたら値を入力する
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            inputValue(value);
            setValue("");
          }
        }}
      />
    </>
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

function getId(idType: "Target" | "Operator" | "Value") {
  return `ConditionSearchBar:${idType}`;
}
