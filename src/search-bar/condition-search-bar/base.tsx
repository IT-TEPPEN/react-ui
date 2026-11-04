"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useBrowserLayoutEffect } from "../../share/use-browser-layout-effect";
import { SelectBoxProvider } from "../../select-box/provider";
import { IdGeneratorProvider, useIdGenerator } from "../id-generator";
import {
  ConditionInputProvider,
  useConditionInputAction,
  useConditionInputState,
} from "./condition-input-management";
import {
  Condition,
  Target,
  TConditionChangeAction,
} from "./condition-input-management/type";
import { ConditionChip } from "./condition-list";
import { SearchBarInputForm, searchInputId } from "./input-form";
import { BiSearchAlt } from "react-icons/bi";
import { useMessages } from "../../table/locale/provider";
import { describeCondition } from "./condition-text";

interface SearcchBarProps {
  size: "small" | "medium" | "large";
  conditions: Condition[];
  /** How conditions are combined. The switch is shown with 2+ conditions. */
  mode?: "and" | "or";
  onChangeMode?: (mode: "and" | "or") => void;
}

interface ConditionSearchBarProps extends SearcchBarProps {
  id: string;
  targets: Target[];
  onChangeCondition: (action: TConditionChangeAction) => void;
}

export const ConditionSearchBar = memo(function CS(
  props: ConditionSearchBarProps
) {
  return (
    <SelectBoxProvider>
      <IdGeneratorProvider id={props.id}>
        <ConditionInputProvider
          targets={props.targets}
          onChangeCondition={props.onChangeCondition}
        >
          <SearchBar
            size={props.size}
            conditions={props.conditions}
            mode={props.mode}
            onChangeMode={props.onChangeMode}
          />
        </ConditionInputProvider>
      </IdGeneratorProvider>
    </SelectBoxProvider>
  );
});

/** Narrower than this, the folded line shows only conditions. */
const NARROW = 520;
const GAP = 6;
/** Room kept on the folded line for the input, and for "+N". */
const INPUT_ROOM = 100;
const MORE_ROOM = 76;

/**
 * The search bar. While the table is being looked at, its conditions take
 * one line (the rest are folded into "+N"), so the table keeps its height;
 * while the search bar is used (focus, a panel, "+N"), all of them show.
 */
export function SearchBar(props: SearcchBarProps) {
  const messages = useMessages();
  const { generateId } = useIdGenerator();
  const state = useConditionInputState();
  const { clearConditions } = useConditionInputAction();
  const ref = useRef<HTMLDivElement>(null);
  const conditions = props.conditions;

  // ---- in use, or folded ----
  const [inUse, setInUse] = useState(false);
  const panelOpen = state.status === "editing";
  const expanded = inUse || panelOpen;

  useEffect(() => {
    const isInside = (target: EventTarget | null) =>
      target instanceof Element &&
      (!!ref.current?.contains(target) ||
        // The list of columns opens outside the bar.
        !!target.closest('[id="ReactUI:SelectBox:OptionsArea"]'));
    const onMouseDown = (e: MouseEvent) => {
      if (!isInside(e.target)) setInUse(false);
    };
    const onFocusIn = (e: FocusEvent) => setInUse(isInside(e.target));
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  // ---- fitting the folded line ----
  const [width, setWidth] = useState(0);
  useBrowserLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const narrow = width > 0 && width < NARROW;
  const mode = props.mode ?? "and";
  const showMode = !!props.onChangeMode && conditions.length >= 2;
  const conditionsKey = JSON.stringify(
    conditions.map((c) => describeCondition(c, messages))
  );
  const foldKey = expanded ? "" : `${conditionsKey}|${width}|${mode}`;
  const [fold, setFold] = useState<{
    key: string;
    shown: number;
    squeeze: boolean;
  } | null>(null);
  const measured = !expanded && fold?.key === foldKey;

  // With every condition on the line, see how many fit (before painting).
  useBrowserLayoutEffect(() => {
    const element = ref.current;
    if (expanded || !element || fold?.key === foldKey) return;

    const style = getComputedStyle(element);
    const room =
      element.clientWidth -
      parseFloat(style.paddingLeft || "0") -
      parseFloat(style.paddingRight || "0");
    const widthOf = (selector: string) =>
      Array.from(element.querySelectorAll<HTMLElement>(selector)).reduce(
        (w, el) => w + el.getBoundingClientRect().width + GAP,
        0
      );
    let used = widthOf(
      '[data-teppen-part="search-icon"], [data-teppen-part="match-mode"], [data-teppen-part="clear-conditions"]'
    );
    const input = narrow ? 0 : INPUT_ROOM;
    const chips = Array.from(
      element.querySelectorAll<HTMLElement>('[data-teppen-part="condition"]')
    );

    let shown = 0;
    let squeeze = false;
    for (let i = 0; i < chips.length; i++) {
      const w = chips[i].getBoundingClientRect().width + GAP;
      const last = i === chips.length - 1;
      if (used + w + (last ? input : input + MORE_ROOM) <= room) {
        used += w;
        shown++;
        continue;
      }
      // Always show the first condition, shortened with "…" if needed.
      if (i === 0) {
        shown = 1;
        squeeze = true;
      }
      break;
    }
    setFold({ key: foldKey, shown, squeeze });
  });

  const shown = expanded
    ? conditions.length
    : measured
    ? fold!.shown
    : conditions.length;
  const folded = conditions.length - shown;
  // Narrow and folded: the line is for the conditions only (with none,
  // it keeps the box to type in).
  const compact = !expanded && narrow && conditions.length > 0;

  return (
    <div
      ref={ref}
      data-teppen-part="search-bar"
      data-folded={!expanded ? "" : undefined}
      className={`relative flex items-center gap-1.5 w-full min-h-10 px-2 py-1 bg-[color:var(--teppen-table-bg,#ffffff)] border border-[color:var(--teppen-table-search-border,#334155)] rounded-[var(--teppen-table-radius,0.375rem)] text-[color:var(--teppen-table-text,#1f2937)] focus-within:border-[color:var(--teppen-table-editing-border,#2459d6)] ${
        expanded ? "flex-wrap" : "flex-nowrap overflow-hidden cursor-pointer"
      } ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
      onClick={(e) => {
        // Tapping the folded line opens the search bar, ready to type.
        if (expanded) return;
        if ((e.target as Element).closest("button, [data-teppen-part=condition]")) return;
        setInUse(true);
        setTimeout(() => document.getElementById(searchInputId(generateId))?.focus(), 0);
      }}
    >
      <span data-teppen-part="search-icon" className="shrink-0 px-1">
        <BiSearchAlt className="text-[color:var(--teppen-table-muted,#475569)]" />
      </span>

      {showMode && !(compact && mode === "and") && (
        <button
          type="button"
          data-teppen-part="match-mode"
          className="shrink-0 inline-flex items-center gap-1 px-1 py-0.5 rounded text-xs whitespace-nowrap text-[color:var(--teppen-table-muted,#475569)] hover:bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))] cursor-pointer"
          title={messages.search.modeHint(mode)}
          aria-label={`${mode === "or" ? messages.search.matchAny : messages.search.matchAll} — ${messages.search.modeHint(mode)}`}
          onClick={() => props.onChangeMode?.(mode === "or" ? "and" : "or")}
        >
          {mode === "or" ? messages.search.matchAny : messages.search.matchAll}
          <span aria-hidden="true" className="text-[11px]">
            ⇄
          </span>
        </button>
      )}

      {conditions.map((c, i) => (
        <ConditionChip
          key={i}
          index={i}
          condition={c}
          hidden={i >= shown}
          squeeze={!expanded && measured && fold!.squeeze && i === 0}
          open={panelOpen && state.editingIndex === i}
        />
      ))}

      {folded > 0 && (
        <button
          type="button"
          data-teppen-part="more-conditions"
          aria-label={messages.search.moreLabel(folded)}
          className="shrink-0 px-2.5 py-px rounded-full border border-dashed border-[color:var(--teppen-table-chip-border,#c9d5f2)] text-[13px] whitespace-nowrap text-[color:var(--teppen-table-editing-border,#2459d6)] hover:bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))] cursor-pointer"
          onClick={() => setInUse(true)}
        >
          {messages.search.more(folded)}
        </button>
      )}

      <div
        className={`flex items-center flex-1 min-w-24 ${compact ? "hidden" : ""}`}
      >
        <SearchBarInputForm
          placeholder={
            conditions.length > 0
              ? messages.search.placeholderMore
              : messages.search.placeholder
          }
        />
      </div>

      {conditions.length > 0 && !compact && (
        <button
          type="button"
          data-teppen-part="clear-conditions"
          className="shrink-0 ml-auto px-1.5 py-0.5 rounded text-[13px] whitespace-nowrap text-[color:var(--teppen-table-editing-border,#2459d6)] hover:bg-[color:var(--teppen-table-active,rgb(36_89_214/0.1))] cursor-pointer"
          onClick={() => clearConditions()}
        >
          {messages.search.clearAll}
        </button>
      )}
    </div>
  );
}
