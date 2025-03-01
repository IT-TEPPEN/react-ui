"use client";

import { IdGeneratorProvider } from "../id-generator";
import { ConditionInputProvider } from "./condition-input-management";
import { Target } from "./condition-input-management/type";
import { ConditionList } from "./condition-list";
import { SearchBarInputForm } from "./input-form";
import { BiSearchAlt } from "react-icons/bi";

interface ConditionSearchBarProps {
  id: string;
  targets: Target[];
  onChangeCondition: (condition: any) => void;
}

export function ConditionSearchBar(props: ConditionSearchBarProps) {
  return (
    <IdGeneratorProvider id={props.id}>
      <ConditionInputProvider targets={props.targets}>
        <SearchBar />
      </ConditionInputProvider>
    </IdGeneratorProvider>
  );
}

export function SearchBar() {
  return (
    <div className="flex items-center gap-1 w-full px-2 py-1 border border-slate-700 rounded-md text-gray-800">
      <div className="px-2">
        <BiSearchAlt className="text-slate-600" />
      </div>
      <ConditionList />
      <SearchBarInputForm />
    </div>
  );
}
