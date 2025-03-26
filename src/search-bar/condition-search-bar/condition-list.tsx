"use client";

import { useConditionInputAction } from "./condition-input-management";
import { TiDeleteOutline } from "react-icons/ti";
import { Condition } from "./condition-input-management/type";

interface IPropsConditionList {
  conditions: Condition[];
}

export function ConditionList(props: IPropsConditionList) {
  return (
    <div className="flex gap-1">
      {props.conditions.map((c, i) => (
        <FixedValue key={i} index={i} condition={c} />
      ))}
    </div>
  );
}

function FixedValue(props: { condition: Condition; index: number }) {
  const { deleteCondition } = useConditionInputAction();

  return (
    <div className="flex items-center gap-2 w-fit px-2 border-2 border-sky-600 rounded shadow">
      <p className="whitespace-nowrap">{getLabel(props.condition)}</p>
      <div>
        <TiDeleteOutline
          className="bg-white hover:bg-slate-300 rounded-full cursor-pointer"
          onClick={() => deleteCondition(props.index)}
        />
      </div>
    </div>
  );
}

function getLabel(condition: Condition): string {
  switch (condition.input.type) {
    case "none":
      return `${condition.target.label} ${condition.operator.label}`;
    case "single string":
      return `${condition.target.label} ${condition.operator.label} ${condition.input.payload.value}`;
    case "single number":
      return `${condition.target.label} ${condition.operator.label} ${condition.input.payload.value}`;
    case "single date":
      return `${condition.target.label} ${
        condition.operator.label
      } ${condition.input.payload.value.toLocaleDateString()}`;
    case "single datetime":
      return `${condition.target.label} ${
        condition.operator.label
      } ${condition.input.payload.value.toLocaleString()}`;
    case "range string":
      return `${condition.target.label} ${condition.operator.label} ${condition.input.payload.from} ～ ${condition.input.payload.to}`;
    case "range number":
      return `${condition.target.label} ${condition.operator.label} ${condition.input.payload.from} ～ ${condition.input.payload.to}`;
    case "range date":
      return `${condition.target.label} ${condition.operator.label} ${condition.input.payload.from} ～ ${condition.input.payload.to}`;
    case "select":
      if (condition.target.type !== "select") {
        throw new Error("type error");
      }

      const selectedKey = condition.input.payload.value;
      return `${condition.target.label} ${condition.operator.label} ${
        condition.target.options.find((o) => o.value === selectedKey)?.label
      }`;
    case "multi select":
      return `${condition.target.label} ${
        condition.operator.label
      } ${condition.input.payload.value.join(", ")}`;
  }
}
