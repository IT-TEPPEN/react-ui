"use client";

import { IdGeneratorProvider } from "../id-generator";
import { ConditionInputProvider } from "./condition-input-management";
import { Target } from "./condition-input-management/type";
import { ConditionList } from "./condition-list";
import { SearchBarInputForm } from "./input-form";

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
    <div className="flex items-center gap-1 px-2 py-1 border rounded-md">
      <ConditionList />
      <SearchBarInputForm />
      <button className="px-2 py-1 text-white bg-blue-500 rounded-md">
        Search
      </button>
    </div>
  );
}
