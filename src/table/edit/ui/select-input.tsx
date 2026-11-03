"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditActionContext } from "../provider";
import {
  DataObject,
  DataRecord,
  TColumnProperty,
  TSelectCellEditingCondition,
} from "../../table/type";
import { useTableIdGenerator } from "../../id";
import { useMessages } from "../../locale/provider";
import { isComposingKey } from "../../operation/event-target";
import { normalizeForSearch } from "../../../share/text/normalize";
import { IIndex } from "../../range/type";
import { useEditFeedback } from "../feedback";
import { TMoveAfterEditing } from "../provider";

type TPropsCellInput = {
  col: TColumnProperty<DataRecord> & TSelectCellEditingCondition<DataRecord>;
  row: DataObject<DataRecord>;
  /** The cell being edited (lit up once saved). */
  cell: IIndex;
  /** Open the options above the cell (no room under it). */
  openAbove?: boolean;
};

/**
 * Editor of a select cell: the cell shows the current value, typing filters
 * the options, and the options open right under the cell, as wide as it.
 * ↑↓ choose, Enter / Tab save (and move), Esc cancels; leaving the cell
 * cancels too, as nothing was chosen.
 */
export function SelectCellInput(props: TPropsCellInput) {
  const IdGenerator = useTableIdGenerator();
  const messages = useMessages();
  const col = props.col;
  const { endEditing, setMoveAfterEditing } = useEditActionContext();
  const { markSaved } = useEditFeedback();
  const prevValue = props.row[col.key] as string;
  const allowEmpty = col.editable ? col.allowEmpty : false;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const options = useMemo(() => {
    const empty = {
      value: "",
      label: prevValue === "" ? messages.selectNone : messages.selectClear,
    };
    return allowEmpty ? [empty, ...col.options] : col.options;
  }, [col.options, allowEmpty, prevValue, messages]);

  const [text, setText] = useState("");
  const shown = useMemo(() => {
    if (text === "") return options;
    const query = normalizeForSearch(text);
    return options.filter((o) => normalizeForSearch(o.label).includes(query));
  }, [options, text]);

  const [active, setActive] = useState(() =>
    Math.max(
      0,
      options.findIndex((o) => o.value === prevValue)
    )
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keep the active option in view.
  useEffect(() => {
    const item = listRef.current?.children[active] as HTMLElement | undefined;
    item?.scrollIntoView?.({ block: "nearest" });
  }, [active, shown]);

  const choose = (value: string, move: TMoveAfterEditing | null) => {
    setMoveAfterEditing(move);
    if (!col.editable || value === prevValue) {
      endEditing();
      return;
    }
    col.onCellBlur(col.key, value, props.row, () => {
      markSaved(props.cell);
      endEditing();
    });
  };

  // Return only after every hook has run, so hooks are always called in the
  // same order.
  if (!col.editable) return <></>;

  const currentLabel =
    options.find((o) => o.value === prevValue)?.label ?? prevValue;

  return (
    <>
      <div className="relative flex items-center w-full h-full">
        <input
          id={IdGenerator.getEditorId()}
          ref={inputRef}
          role="combobox"
          aria-expanded={true}
          aria-controls={`${IdGenerator.getEditorId()}:options`}
          aria-activedescendant={
            shown[active]
              ? `${IdGenerator.getEditorId()}:option-${active}`
              : undefined
          }
          aria-label={col.label ?? String(col.key)}
          autoComplete="off"
          className="block w-full h-full pl-[9px] pr-6 border-0 outline-none bg-transparent [font:inherit] text-[color:var(--teppen-table-text,#111827)]"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
          }}
          onBlur={() => {
            // Clicking an option keeps the focus (see onMouseDown below), so
            // a blur means the user left without choosing.
            setMoveAfterEditing(null);
            endEditing();
          }}
          onKeyDown={(e) => {
            if (isComposingKey(e.nativeEvent)) return;

            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              if (shown.length === 0) return;
              const step = e.key === "ArrowDown" ? 1 : shown.length - 1;
              setActive((i) => (i + step) % shown.length);
            } else if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              const option = shown[active];
              const move: TMoveAfterEditing =
                e.key === "Enter"
                  ? e.shiftKey
                    ? "up"
                    : "down"
                  : e.shiftKey
                    ? "left"
                    : "right";
              if (option) choose(option.value, move);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setMoveAfterEditing(null);
              endEditing();
            }
          }}
        />
        {text === "" && (
          // The current value, until the user types.
          <span
            aria-hidden="true"
            className="absolute left-[9px] right-6 truncate pointer-events-none text-[color:var(--teppen-table-text,#111827)]"
          >
            {currentLabel || (
              <span className="text-[color:var(--teppen-table-muted,#6b7280)]">
                {messages.selectPlaceholder}
              </span>
            )}
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute right-2 text-[10px] text-[color:var(--teppen-table-editing-border,#2459d6)]"
        >
          ▼
        </span>
      </div>

      <ul
        ref={listRef}
        id={`${IdGenerator.getEditorId()}:options`}
        role="listbox"
        data-teppen-part="editor-options"
        className="absolute left-0 right-0 z-20 max-h-60 overflow-y-auto py-1 bg-[color:var(--teppen-table-bg,#ffffff)] border border-[color:var(--teppen-table-editing-border,#2459d6)] shadow-lg"
        style={props.openAbove ? { bottom: "100%" } : { top: "100%" }}
      >
        {shown.length === 0 && (
          <li className="px-[9px] py-1.5 text-[color:var(--teppen-table-muted,#6b7280)]">
            {messages.noOptions}
          </li>
        )}
        {shown.map((option, i) => (
          <li
            key={option.value}
            id={`${IdGenerator.getEditorId()}:option-${i}`}
            role="option"
            aria-selected={i === active}
            className={`flex justify-between gap-2 px-[9px] py-1.5 cursor-pointer text-[color:var(--teppen-table-text,#111827)] ${
              i === active
                ? "bg-[color:var(--teppen-table-selection-bg,rgb(36_89_214/0.08))]"
                : ""
            }`}
            onMouseEnter={() => setActive(i)}
            onMouseDown={(e) => {
              // Keep the focus in the input until the value is saved.
              e.preventDefault();
              e.stopPropagation();
              choose(option.value, null);
            }}
          >
            <span className="truncate">{option.label}</span>
            {option.value === prevValue && (
              <span className="font-bold text-[color:var(--teppen-table-editing-border,#2459d6)]">
                ✓
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
