"use client";

import { SelectBox } from "../select-box";
import { Operator, Target } from "./condition-input-management/type";

const operators: Operator[] = [
  { key: "eq", label: "=", type: "string" },
  { key: "neq", label: "!=", type: "string" },
  { key: "gt", label: ">", type: "number" },
  { key: "lt", label: "<", type: "number" },
  { key: "gte", label: ">=", type: "number" },
  { key: "lte", label: "<=", type: "number" },
  { key: "between", label: "between", type: "number" },
  { key: "like", label: "like", type: "string" },
  { key: "not_like", label: "not like", type: "string" },
  { key: "in", label: "in", type: "string" },
  { key: "not_in", label: "not in", type: "string" },
  { key: "is_null", label: "is null", type: "string" },
  { key: "is_not_null", label: "is not null", type: "string" },
];

interface ConditionSearchBarProps {
  targets: Target[];
}

export function ConditionSearchBar(props: ConditionSearchBarProps) {
  return (
    <div className="flex items-center px-2 py-1 border rounded-md">
      <SelectBox
        id="TargetSelectBox"
        onSelect={() => {}}
        options={props.targets.map((t) => ({
          value: t.key,
          label: t.label,
        }))}
        placeholder="Select target"
        no_appearance
        no_icon
      />
      <SelectBox
        id="OperatorSelectBox"
        onSelect={() => {}}
        options={operators.map((t) => ({
          value: t.key,
          label: t.label,
        }))}
        placeholder="Select target"
        no_appearance
        no_icon
      />
      <input
        className="no_appearance border-none p-2 focus:outline-none focus-visible:outline-none bg-transparent"
        type="text"
        placeholder="Search text"
      />
      <button className="px-2 py-1 text-white bg-blue-500 rounded-md">
        Search
      </button>
    </div>
  );
}
