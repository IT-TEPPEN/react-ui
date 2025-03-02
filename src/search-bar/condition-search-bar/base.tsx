"use client";

import { useEffect, useRef } from "react";
import { SelectBoxProvider } from "../../select-box/provider";
import { IdGeneratorProvider } from "../id-generator";
import { ConditionInputProvider } from "./condition-input-management";
import { Target } from "./condition-input-management/type";
import { ConditionList } from "./condition-list";
import { SearchBarInputForm } from "./input-form";
import { BiSearchAlt } from "react-icons/bi";

interface SearcchBarProps {
  size: "small" | "medium" | "large";
}

interface ConditionSearchBarProps extends SearcchBarProps {
  id: string;
  targets: Target[];
  onChangeCondition: (condition: any) => void;
}

export function ConditionSearchBar(props: ConditionSearchBarProps) {
  return (
    <SelectBoxProvider>
      <IdGeneratorProvider id={props.id}>
        <ConditionInputProvider targets={props.targets}>
          <SearchBar size={props.size} />
        </ConditionInputProvider>
      </IdGeneratorProvider>
    </SelectBoxProvider>
  );
}

export function SearchBar(props: SearcchBarProps) {
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
      className={`flex items-center gap-1 w-full px-2 py-1 bg-white border border-slate-700 rounded-md text-gray-800 ${
        props.size === "small"
          ? "text-sm"
          : props.size === "large"
          ? "text-lg"
          : ""
      }`}
    >
      <div className="px-2">
        <BiSearchAlt className="text-slate-600" />
      </div>
      <div
        ref={ref}
        className="relative flex w-full items-center gap-1 overflow-x-auto no_scrollbar"
      >
        <ConditionList />
        <div className="flex items-center min-w-64 w-full">
          <SearchBarInputForm size={props.size} />
        </div>
      </div>
    </div>
  );
}
