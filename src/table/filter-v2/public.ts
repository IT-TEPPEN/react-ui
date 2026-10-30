import { Condition } from "../../search-bar";
import {
  KEYWORD_TARGET_KEY,
  usableOperatorsFor,
} from "../../share/search-operator/constant";
import { parseNumberText } from "../../share/text/normalize";
import { DataRecord, TFilter, TFilterOperator, TTableColumn } from "../table/type";

/**
 * Converts a filter given by the app (`{ key, operator, value }`) into the
 * search bar's condition. Returns null, with a warning, when the column,
 * operator or value does not fit.
 */
export function toCondition<T extends DataRecord>(
  filter: TFilter,
  cols: TTableColumn<T>[],
  allColumnsLabel: string
): Condition | null {
  const warn = (reason: string) => {
    console.warn(`Ignored filter ${JSON.stringify(filter)}: ${reason}`);
    return null;
  };

  let target: Condition["target"];
  if (filter.key === KEYWORD_TARGET_KEY) {
    target = { key: KEYWORD_TARGET_KEY, label: allColumnsLabel, type: "string" };
  } else {
    const col = cols.find((c) => c.key === filter.key);
    if (!col) return warn("no such column");

    const base = { key: String(col.key), label: col.label ?? String(col.key) };
    target =
      col.type === "select"
        ? { ...base, type: "select", options: col.options }
        : { ...base, type: col.type };
  }

  const operator = usableOperatorsFor(target).find(
    (o) => o.key === `${target.type}:${filter.operator}`
  );
  if (!operator) return warn(`operator not available for ${target.type}`);

  const value = filter.value;
  switch (operator.inputType) {
    case "none":
      return { target, operator, input: { type: "none" } };
    case "single string":
      if (typeof value !== "string" && typeof value !== "number") {
        return warn("value must be text");
      }
      return { target, operator, input: { type: operator.inputType, payload: { value: String(value) } } };
    case "single number": {
      const number =
        typeof value === "number" ? value : typeof value === "string" ? parseNumberText(value) : null;
      if (number === null || isNaN(number)) return warn("value must be a number");
      return { target, operator, input: { type: operator.inputType, payload: { value: number } } };
    }
    case "single date":
    case "single datetime": {
      const date =
        value instanceof Date ? value : typeof value === "string" || typeof value === "number" ? new Date(value) : null;
      if (!date || isNaN(date.getTime())) return warn("value must be a date");
      return { target, operator, input: { type: operator.inputType, payload: { value: date } } } as Condition;
    }
    case "select":
      if (typeof value !== "string") return warn("value must be an option value");
      return { target, operator, input: { type: operator.inputType, payload: { value } } };
    case "multi select":
      if (!Array.isArray(value)) return warn("value must be a list of option values");
      return { target, operator, input: { type: operator.inputType, payload: { value: value.map(String) } } };
  }
}

/** Converts a search bar condition into the app-facing filter. */
export function fromCondition(condition: Condition): TFilter {
  const filter: TFilter = {
    key: condition.target.key,
    operator: condition.operator.key.split(":")[1] as TFilterOperator,
  };

  const input = condition.input;
  switch (input.type) {
    case "none":
      return filter;
    case "multi select":
      return { ...filter, value: [...input.payload.value] };
    case "single string":
    case "single number":
    case "single date":
    case "single datetime":
    case "select":
      return { ...filter, value: input.payload.value };
    default:
      return filter;
  }
}
