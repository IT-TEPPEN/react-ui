"use client";

import { useConditionInputAction } from "./condition-input-management";
import { TiDeleteOutline } from "react-icons/ti";
import { Condition } from "./condition-input-management/type";
import { useMessages } from "../../table/locale/provider";
import type { TMessages } from "../../table/locale/messages";

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
  const messages = useMessages();

  return (
    <div
      data-teppen-part="condition"
      className="flex items-center gap-2 w-fit px-2 border-2 border-[color:var(--teppen-table-accent,#0284c7)] rounded shadow"
    >
      <p className="whitespace-nowrap">{getLabel(props.condition, messages)}</p>
      <div>
        <TiDeleteOutline
          className="bg-[color:var(--teppen-table-bg,#ffffff)] hover:bg-[color:var(--teppen-table-hover,#cbd5e1)] rounded-full cursor-pointer"
          onClick={() => deleteCondition(props.index)}
        />
      </div>
    </div>
  );
}

function getLabel(condition: Condition, messages: TMessages): string {
  return messages.search.condition(
    condition.target.label,
    condition.operator.key,
    valueText(condition, messages)
  );
}

/** The value of a condition as shown in its chip; null when it has none. */
function valueText(condition: Condition, messages: TMessages): string | null {
  const input = condition.input;
  const options =
    condition.target.type === "select" ? condition.target.options : [];
  const label = (value: string) =>
    options.find((o) => o.value === value)?.label ?? value;

  switch (input.type) {
    case "none":
      return null;
    case "single string":
    case "single number":
      return String(input.payload.value);
    case "single date":
      return input.payload.value.toLocaleDateString(messages.dateLocale);
    case "single datetime":
      return input.payload.value.toLocaleString(messages.dateLocale);
    case "range string":
    case "range number":
    case "range date":
      return `${input.payload.from} ～ ${input.payload.to}`;
    case "select":
      return label(input.payload.value);
    case "multi select":
      return input.payload.value.map(label).join(messages.search.valueSeparator);
  }
}
