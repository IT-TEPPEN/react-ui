"use client";

import type { TComponentType } from "../id-generator/type";

import { Options, SelectBox } from "../../select-box";
import { IdGenerator as SelectBoxIds } from "../../select-box/lib";
import {
  useConditionInputAction,
  useConditionInputState,
} from "./condition-input-management";
import { useIdGenerator } from "../id-generator";
import { useMessages } from "../../table/locale/provider";
import {
  DEFAULT_SEARCH_OPERATOR,
  KEYWORD_TARGET_KEY,
} from "../../share/search-operator";
import { Condition } from "./condition-input-management/type";
import { ConditionPanel } from "./condition-panel";
import { conditionChipId } from "./condition-list";

// The option that searches every column for the typed word.
const SEARCH_EVERYWHERE = "teppen:search-everywhere";

/** Id of the search box's input (the panel for a new condition opens under it). */
export const searchInputId = (generateId: (name: TComponentType) => string) =>
  SelectBoxIds.generateIdSelectBoxInputArea(generateId("TargetInput"));

/**
 * The box to type in: a word searches every column (Enter), or a column is
 * chosen, which opens the panel for its condition.
 */
export function SearchBarInputForm(props: { placeholder: string }) {
  const messages = useMessages();
  const { generateId } = useIdGenerator();
  const state = useConditionInputState();
  const { inputTarget, applyCondition } = useConditionInputAction();
  const { targets } = state;

  // Typing a word and pressing Enter searches every column for it (when the
  // table allows it); to filter one column, choose it from the list.
  const keywordTarget = targets.find((t) => t.key === KEYWORD_TARGET_KEY);
  const options: Options[] = targets.map((t) => ({ value: t.key, label: t.label }));
  if (keywordTarget) {
    options.unshift({
      value: SEARCH_EVERYWHERE,
      label: "",
      fromSearchText: (text: string) =>
        text.trim() === "" ? null : messages.search.searchEverywhere(text.trim()),
    });
  }

  const focusInput = () =>
    setTimeout(() => document.getElementById(searchInputId(generateId))?.focus(), 0);

  return (
    <>
      <SelectBox
        id={generateId("TargetInput")}
        onSelect={(value, searchText) => {
          if (value === SEARCH_EVERYWHERE && keywordTarget) {
            applyCondition({
              target: keywordTarget,
              operator: DEFAULT_SEARCH_OPERATOR.find((o) => o.key === "string:like")!,
              input: { type: "single string", payload: { value: searchText.trim() } },
            } as Condition);
            focusInput();
            return;
          }
          inputTarget(value);
        }}
        options={options}
        placeholder={props.placeholder}
        no_appearance
        no_icon
      />
      {state.status === "editing" && (
        <ConditionPanel
          // A new panel for each condition opened.
          key={`${state.target.key}:${state.editingIndex}`}
          target={state.target}
          initial={state.initial}
          editingIndex={state.editingIndex}
          anchorId={
            state.editingIndex === null
              ? searchInputId(generateId)
              : conditionChipId(generateId, state.editingIndex)
          }
          onDone={focusInput}
        />
      )}
    </>
  );
}
