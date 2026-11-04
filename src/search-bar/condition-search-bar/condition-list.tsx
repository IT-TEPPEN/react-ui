"use client";

import type { TComponentType } from "../id-generator/type";

import { useConditionInputAction } from "./condition-input-management";
import { Condition } from "./condition-input-management/type";
import { useMessages } from "../../table/locale/provider";
import { useIdGenerator } from "../id-generator";
import { describeCondition } from "./condition-text";

/** Id of the chip of the condition at `index` (the panel opens under it). */
export const conditionChipId = (
  generateId: (name: TComponentType) => string,
  index: number
) => generateId(`Condition-${index}`);

/**
 * One condition, as words ("部署 が 営業部"). Click it to change it in the
 * panel; × removes it.
 */
export function ConditionChip(props: {
  condition: Condition;
  index: number;
  /** Folded away (the search bar shows "+N" instead). */
  hidden?: boolean;
  /** Shortened with "…" to fit the folded line. */
  squeeze?: boolean;
  /** Its panel is open. */
  open?: boolean;
}) {
  const { editCondition, deleteCondition } = useConditionInputAction();
  const { generateId } = useIdGenerator();
  const messages = useMessages();
  const { column, rest } = describeCondition(props.condition, messages);
  const edit = () => editCondition(props.index, props.condition);

  return (
    <span
      id={conditionChipId(generateId, props.index)}
      data-teppen-part="condition"
      role="button"
      tabIndex={0}
      hidden={props.hidden}
      aria-label={`${column}${rest}（${messages.search.editCondition}）`}
      className={`inline-flex items-center gap-1.5 max-w-full pl-2.5 pr-1 py-0.5 rounded-full border text-[13px] leading-normal cursor-pointer bg-[color:var(--teppen-table-chip-bg,#eef2fb)] text-[color:var(--teppen-table-text,#1f2937)] hover:border-[color:var(--teppen-table-editing-border,#2459d6)] ${
        props.open
          ? "border-[color:var(--teppen-table-editing-border,#2459d6)]"
          : "border-[color:var(--teppen-table-chip-border,#c9d5f2)]"
      } ${props.squeeze ? "shrink min-w-20" : "shrink-0"}`}
      onClick={edit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          edit();
        }
      }}
    >
      <span className="min-w-0 truncate">
        <b>{column}</b>
        {rest}
      </span>
      <button
        type="button"
        aria-label={messages.search.removeCondition}
        className="inline-grid place-items-center w-5 h-5 rounded-full text-[color:var(--teppen-table-muted,#6b7280)] hover:bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          deleteCondition(props.index);
        }}
      >
        ×
      </button>
    </span>
  );
}
