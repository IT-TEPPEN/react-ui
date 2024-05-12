"use client";

import { createContext, useContext, useState } from "react";
import { TReturnUseFilterReducer } from "./types";
import { useFilterReducer } from "./hooks";

const FilterContext = createContext<
  TReturnUseFilterReducer<{ [key: string]: string | number }>
>({
  addFilter: () => {},
  removeFilter: () => {},
  clearFilter: () => {},
  filter: () => [],
  filterConditions: [],
});

const SelectedFilterKey = createContext<{
  selectedFilterKey: string | null;
  setSelectedFilterKey: (key: string | null) => void;
}>({
  selectedFilterKey: null,
  setSelectedFilterKey: () => {},
});

export function FilterProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const [selectedFilterKey, setSelectedFilterKey] = useState<string | null>(
    null
  );

  return (
    <SelectedFilterKey.Provider
      value={{ selectedFilterKey, setSelectedFilterKey }}
    >
      <FilterContext.Provider value={useFilterReducer()}>
        {children}
      </FilterContext.Provider>
    </SelectedFilterKey.Provider>
  );
}

export function useFilterContext() {
  return { ...useContext(FilterContext), ...useContext(SelectedFilterKey) };
}
