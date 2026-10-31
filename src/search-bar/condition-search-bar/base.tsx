"use client";

import { memo, useEffect, useRef } from "react";
import { SelectBoxProvider } from "../../select-box/provider";
import { IdGeneratorProvider } from "../id-generator";
import { ConditionInputProvider } from "./condition-input-management";
import {
  Condition,
  Target,
  TConditionChangeAction,
} from "./condition-input-management/type";
import { ConditionList } from "./condition-list";
import { SearchBarInputForm } from "./input-form";
import { BiSearchAlt } from "react-icons/bi";
import { useMessages } from "../../table/locale/provider";

interface SearcchBarProps {
  size: "small" | "medium" | "large";
  conditions: Condition[];
  /** How conditions are combined. The toggle is shown with 2+ conditions. */
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

export function SearchBar(props: SearcchBarProps) {
  const messages = useMessages();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const element = ref.current;

      const scrollX = (e: WheelEvent) => {
        if (e.deltaY === 0) return;

        e.preventDefault();
        element.scrollLeft += e.deltaY;
      };

      element.addEventListener("wheel", scrollX);

      return () => {
        element.removeEventListener("wheel", scrollX);
      };
    }
  }, [ref]);

  return (
    <div
      data-teppen-part="search-bar"
      className={`flex items-center gap-1 w-full px-2 py-1 bg-[color:var(--teppen-table-bg,#ffffff)] border border-[color:var(--teppen-table-search-border,#334155)] rounded-[var(--teppen-table-radius,0.375rem)] text-[color:var(--teppen-table-text,#1f2937)] ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
    >
      <div className="px-2">
        <BiSearchAlt className="text-[color:var(--teppen-table-muted,#475569)]" />
      </div>
      <div
        ref={ref}
        className="relative flex w-full items-center gap-1 overflow-x-auto teppen-no-scrollbar"
      >
        <style>{`
          .teppen-no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .teppen-no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <ConditionList conditions={props.conditions} />
        {props.onChangeMode && props.conditions.length >= 2 && (
          <button
            type="button"
            className="shrink-0 px-2 rounded border border-[color:var(--teppen-table-control-border,#94a3b8)] text-xs font-bold text-[color:var(--teppen-table-muted,#475569)] hover:bg-[color:var(--teppen-table-hover,#f1f5f9)] cursor-pointer"
            title={messages.search.modeHint(props.mode ?? "and")}
            aria-pressed={props.mode === "or"}
            onClick={() =>
              props.onChangeMode?.(props.mode === "or" ? "and" : "or")
            }
          >
            {props.mode === "or"
              ? messages.search.matchAny
              : messages.search.matchAll}
          </button>
        )}
        <div className="flex items-center min-w-64 w-full">
          <SearchBarInputForm size={props.size} />
        </div>
      </div>
    </div>
  );
}
