"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SEARCH_OPERATOR,
  usableOperatorsFor,
} from "../../share/search-operator";
import { parseNumberText } from "../../share/text/normalize";
import { isComposingKey } from "../../table/operation/event-target";
import { useMessages } from "../../table/locale/provider";
import { useIdGenerator } from "../id-generator";
import { useConditionInputAction } from "./condition-input-management";
import {
  Condition,
  SearchInput,
  Target,
} from "./condition-input-management/type";
import { describeCondition } from "./condition-text";

type TOperator = (typeof DEFAULT_SEARCH_OPERATOR)[number];

// The order of the condition buttons, by column type (others as listed).
const ORDER: Record<string, string[]> = {
  number: ["gte", "lte", "eq", "neq", "gt", "lt"],
  date: ["gte", "lte", "eq", "neq", "gt", "lt", "is_null", "is_not_null"],
  datetime: ["gte", "lte", "gt", "lt", "is_null", "is_not_null"],
};

/** The conditions offered for a column, in the order shown. */
export function panelOperators(target: Target): TOperator[] {
  // Select columns take one or more values: "is" / "is not" are in / not in.
  const operators = usableOperatorsFor(target).filter(
    (o) => o.key !== "select:eq" && o.key !== "select:neq"
  );
  const order = ORDER[target.type];
  if (!order) return operators;
  const rank = (o: TOperator) => {
    const i = order.indexOf(o.key.split(":")[1]);
    return i === -1 ? order.length : i;
  };
  return [...operators].sort((a, b) => rank(a) - rank(b));
}

const pad = (n: number) => String(n).padStart(2, "0");
const dateText = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const datetimeText = (d: Date) =>
  `${dateText(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** The panel's starting state, from the condition being changed. */
function initialState(target: Target, initial?: Condition) {
  const operators = panelOperators(target);
  let key: string = initial?.operator.key ?? operators[0]?.key ?? "";
  if (key === "select:eq") key = "select:in";
  if (key === "select:neq") key = "select:not_in";

  let text = "";
  let checked: string[] = [];
  const input = initial?.input;
  if (input) {
    switch (input.type) {
      case "single string":
      case "single number":
        text = String(input.payload.value);
        break;
      case "single date":
        text = dateText(input.payload.value);
        break;
      case "single datetime":
        text = datetimeText(input.payload.value);
        break;
      case "select":
        checked = [input.payload.value];
        break;
      case "multi select":
        checked = [...input.payload.value];
        break;
    }
  }
  return { key, text, checked };
}

/**
 * Sets one condition on a column, or changes one: the condition (buttons)
 * and the value in one place, with what it will read like. Enter applies,
 * Escape closes.
 */
export function ConditionPanel(props: {
  target: Target;
  initial?: Condition;
  /** The condition being changed, or null for a new one. */
  editingIndex: number | null;
  /** Id of the element the panel opens under (a condition, or the input). */
  anchorId: string;
  /** Called after the panel applies, removes or closes. */
  onDone: () => void;
}) {
  const messages = useMessages();
  const { generateId } = useIdGenerator();
  const { applyCondition, deleteCondition, reset } = useConditionInputAction();
  const ref = useRef<HTMLDivElement>(null);
  const operators = useMemo(() => panelOperators(props.target), [props.target]);

  const [state] = useState(() => initialState(props.target, props.initial));
  const [key, setKey] = useState<string>(state.key);
  const [text, setText] = useState(state.text);
  const [checked, setChecked] = useState<string[]>(state.checked);
  const [error, setError] = useState<string | null>(null);

  const operator = operators.find((o) => o.key === key) ?? operators[0];
  const isAllColumns = props.target.key === "*";
  const editing = props.editingIndex !== null;

  // Open right under the anchor, inside the search bar.
  const [position, setPosition] = useState({ top: 0, left: 0 });
  useLayoutEffect(() => {
    const panel = ref.current;
    const root = panel?.offsetParent as HTMLElement | null;
    const anchor = document.getElementById(props.anchorId);
    if (!panel || !root || !anchor) return;
    const r = root.getBoundingClientRect();
    const a = anchor.getBoundingClientRect();
    setPosition({
      top: a.bottom - r.top + 6,
      left: Math.max(0, Math.min(a.left - r.left, r.width - panel.offsetWidth)),
    });
  }, [props.anchorId]);

  // Start in the value (or the first option).
  useEffect(() => {
    const first = ref.current?.querySelector<HTMLElement>(
      "[data-panel-value], input[type=checkbox], [aria-pressed=true]"
    );
    first?.focus();
  }, []);

  // A click outside closes the panel without a change.
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (ref.current?.contains(target)) return;
      // A click on a condition opens it instead (handled there).
      if (target?.closest?.('[data-teppen-part="condition"]')) return;
      reset();
      props.onDone();
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  if (!operator) return null;

  const needsValue = operator.inputType !== "none";

  // The condition as it is now, or a message when it is not complete.
  const build = (): Condition | string => {
    let input: SearchInput;
    switch (operator.inputType) {
      case "none":
        input = { type: "none" };
        break;
      case "single string":
        if (text.trim() === "") return messages.search.needValue;
        input = { type: "single string", payload: { value: text.trim() } };
        break;
      case "single number": {
        const value = parseNumberText(text);
        if (value === null) return messages.search.needValue;
        input = { type: "single number", payload: { value } };
        break;
      }
      case "single date": {
        const [y, m, d] = text.split("-").map(Number);
        if (!y || !m || !d) return messages.search.needValue;
        input = { type: "single date", payload: { value: new Date(y, m - 1, d) } };
        break;
      }
      case "single datetime": {
        const value = new Date(text);
        if (text === "" || isNaN(value.getTime())) return messages.search.needValue;
        input = { type: "single datetime", payload: { value } };
        break;
      }
      case "multi select":
        if (checked.length === 0) return messages.search.needChoice;
        // In the order of the options, not the order they were checked.
        input = {
          type: "multi select",
          payload: {
            value: (props.target.type === "select" ? props.target.options : [])
              .map((o) => o.value)
              .filter((v) => checked.includes(v)),
          },
        };
        break;
      default:
        return messages.search.needValue;
    }
    return { target: props.target, operator, input } as Condition;
  };

  const built = build();
  const preview =
    typeof built === "string" ? null : describeCondition(built, messages);

  const apply = () => {
    const condition = build();
    if (typeof condition === "string") {
      setError(condition);
      return;
    }
    applyCondition(condition);
    props.onDone();
  };

  const valueId = generateId("ValueInput");
  const options = props.target.type === "select" ? props.target.options : [];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={isAllColumns ? messages.search.everywhereTitle : props.target.label}
      data-teppen-part="condition-panel"
      className="absolute z-30 grid gap-2.5 w-[min(360px,calc(100vw-32px))] p-3 rounded-lg border border-[color:var(--teppen-table-editing-border,#2459d6)] bg-[color:var(--teppen-table-bg,#ffffff)] text-[color:var(--teppen-table-text,#1f2937)] text-sm shadow-lg"
      style={position}
      onKeyDown={(e) => {
        if (isComposingKey(e.nativeEvent)) return;
        if (e.key === "Enter" && !(e.target instanceof HTMLButtonElement)) {
          e.preventDefault();
          apply();
        } else if (e.key === "Escape") {
          e.preventDefault();
          reset();
          props.onDone();
        }
      }}
    >
      <div className="flex justify-between items-baseline gap-2">
        <span className="font-bold">
          {isAllColumns ? messages.search.everywhereTitle : props.target.label}
        </span>
        {!isAllColumns && (
          <span className="text-xs text-[color:var(--teppen-table-muted,#6b7280)]">
            {messages.search.typeName(props.target.type)}
          </span>
        )}
      </div>

      {operators.length > 1 && (
        <div className="flex flex-wrap gap-1.5" role="group">
          {operators.map((o) => {
            const pressed = o.key === operator.key;
            return (
              <button
                key={o.key}
                type="button"
                aria-pressed={pressed}
                className={`px-2.5 py-0.5 rounded-full border text-[13px] cursor-pointer ${
                  pressed
                    ? "border-[color:var(--teppen-table-editing-border,#2459d6)] bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))] text-[color:var(--teppen-table-editing-border,#2459d6)] font-bold"
                    : "border-[color:var(--teppen-table-border,#e5e7eb)] bg-[color:var(--teppen-table-bg,#ffffff)]"
                }`}
                onClick={() => {
                  setKey(o.key);
                  setError(null);
                }}
              >
                {messages.search.choice(o.key)}
              </button>
            );
          })}
        </div>
      )}

      {needsValue && operator.inputType === "multi select" && (
        <div
          role="group"
          aria-label={props.target.label}
          className="grid gap-0.5 max-h-44 overflow-y-auto"
        >
          {options.map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-2 px-1 py-0.5 rounded cursor-pointer hover:bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))]"
            >
              <input
                type="checkbox"
                checked={checked.includes(o.value)}
                onChange={(e) => {
                  setError(null);
                  setChecked((current) =>
                    e.target.checked
                      ? [...current, o.value]
                      : current.filter((v) => v !== o.value)
                  );
                }}
              />
              {o.label}
            </label>
          ))}
        </div>
      )}

      {needsValue && operator.inputType !== "multi select" && (
        <input
          id={valueId}
          data-panel-value=""
          aria-label={messages.search.valuePlaceholder}
          autoComplete="off"
          className="w-full px-2.5 py-1.5 rounded-md border border-[color:var(--teppen-table-border,#e5e7eb)] bg-[color:var(--teppen-table-bg,#ffffff)] text-[color:var(--teppen-table-text,#1f2937)] [font:inherit] focus:outline-none focus:border-[color:var(--teppen-table-editing-border,#2459d6)]"
          type={
            operator.inputType === "single date"
              ? "date"
              : operator.inputType === "single datetime"
              ? "datetime-local"
              : "text"
          }
          inputMode={operator.inputType === "single number" ? "decimal" : undefined}
          placeholder={
            operator.inputType === "single string" ||
            operator.inputType === "single number"
              ? messages.search.valuePlaceholder
              : undefined
          }
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setError(null);
          }}
        />
      )}

      {error ? (
        <div role="alert" className="text-xs text-[color:var(--teppen-table-error,#c4312b)]">
          {error}
        </div>
      ) : (
        <div className="text-[13px] text-[color:var(--teppen-table-muted,#6b7280)]">
          {preview ? (
            <>
              {messages.search.preview}
              <b className="text-[color:var(--teppen-table-text,#1f2937)]">
                {preview.column}
                {preview.rest}
              </b>
            </>
          ) : (
            needsValue &&
            (operator.inputType === "multi select"
              ? messages.search.needChoice
              : messages.search.needValue)
          )}
        </div>
      )}

      <div className="flex justify-between items-center gap-2">
        <span className="flex gap-3 text-xs text-[color:var(--teppen-table-muted,#6b7280)]">
          <span>
            <kbd className="font-bold [font-family:inherit]">Enter</kbd>{" "}
            {messages.search.enterKey}
          </span>
          <span>
            <kbd className="font-bold [font-family:inherit]">Esc</kbd>{" "}
            {messages.search.escapeKey}
          </span>
        </span>
        <span className="flex gap-2">
          {editing && (
            <button
              type="button"
              className="px-3 py-1 rounded-md border border-[color:var(--teppen-table-border,#e5e7eb)] bg-[color:var(--teppen-table-bg,#ffffff)] text-[color:var(--teppen-table-error,#c4312b)] cursor-pointer"
              onClick={() => {
                deleteCondition(props.editingIndex!);
                props.onDone();
              }}
            >
              {messages.search.remove}
            </button>
          )}
          <button
            type="button"
            className="px-3 py-1 rounded-md bg-[color:var(--teppen-table-editing-border,#2459d6)] text-[color:var(--teppen-table-bg,#ffffff)] font-bold cursor-pointer"
            onClick={apply}
          >
            {editing ? messages.search.change : messages.search.add}
          </button>
        </span>
      </div>
    </div>
  );
}
