"use client";

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
    <IdGeneratorProvider id={props.id}>
      <ConditionInputProvider targets={props.targets}>
        <SearchBar size={props.size} />
      </ConditionInputProvider>
    </IdGeneratorProvider>
  );
}

export function SearchBar(props: SearcchBarProps) {
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
      <ConditionList />
      <SearchBarInputForm />
    </div>
  );
}
