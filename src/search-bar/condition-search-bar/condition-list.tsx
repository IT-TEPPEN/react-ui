"use client";

import {
  useConditionInputAction,
  useConditionInputState,
} from "./condition-input-management";
import { TiDeleteOutline } from "react-icons/ti";

export function ConditionList() {
  const { conditions } = useConditionInputState();

  return (
    <div className="flex gap-1">
      {conditions.map((c, i) => (
        <FixedValue
          key={i}
          index={i}
          label={`${c.target.label} ${c.operator.label} ${c.value}`}
        />
      ))}
    </div>
  );
}

function FixedValue(props: { label: string; index: number }) {
  const { deleteCondition } = useConditionInputAction();

  return (
    <div className="flex items-center gap-2 w-fit px-2 border-2 border-sky-600 rounded shadow">
      <p className="whitespace-nowrap">{props.label}</p>
      <div>
        <TiDeleteOutline
          className="bg-white hover:bg-slate-300 rounded-full cursor-pointer"
          onClick={() => deleteCondition(props.index)}
        />
      </div>
    </div>
  );
}
