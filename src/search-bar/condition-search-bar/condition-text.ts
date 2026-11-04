import type { TMessages } from "../../table/locale/messages";
import { Condition } from "./condition-input-management/type";

/** The values of a condition as shown to the user (labels of options). */
export function conditionValues(
  condition: Condition,
  messages: TMessages
): string[] {
  const input = condition.input;
  const options =
    condition.target.type === "select" ? condition.target.options : [];
  const label = (value: string) =>
    options.find((o) => o.value === value)?.label ?? value;

  switch (input.type) {
    case "none":
      return [];
    case "single string":
    case "single number":
      return [String(input.payload.value)];
    case "single date":
      return [input.payload.value.toLocaleDateString(messages.dateLocale)];
    case "single datetime":
      return [
        input.payload.value.toLocaleString(messages.dateLocale, {
          dateStyle: "short",
          timeStyle: "short",
        }),
      ];
    case "range string":
    case "range number":
    case "range date":
      return [`${input.payload.from} ～ ${input.payload.to}`];
    case "select":
      return [label(input.payload.value)];
    case "multi select":
      return input.payload.value.map(label);
  }
}

/**
 * A condition as words: the column, and what follows it ("部署" + " が 営業部",
 * "年齢" + " ≥ 30").
 */
export function describeCondition(condition: Condition, messages: TMessages) {
  return {
    column: condition.target.label,
    rest: messages.search.phrase(
      condition.operator.key,
      conditionValues(condition, messages)
    ),
  };
}
