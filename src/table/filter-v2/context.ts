import { createContext, useContext } from "react";
import {
  TFilterActionContext,
  TFilterFunctionContext,
  TFilterStateContext,
} from "./type";

export const FilterStateContext = createContext<TFilterStateContext | null>(
  null
);
export const FilterActionContext = createContext<TFilterActionContext | null>(
  null
);
export const FilterFunctionContext =
  createContext<TFilterFunctionContext | null>(null);

export function useFilterState() {
  const context = useContext(FilterStateContext);

  if (!context) {
    throw new Error("useFilterState must be used within a FilterProvider");
  }

  return context;
}

export function useFilterAction() {
  const context = useContext(FilterActionContext);

  if (!context) {
    throw new Error("useFilterAction must be used within a FilterProvider");
  }

  return context;
}

export function useFilterFunctions() {
  const context = useContext(FilterFunctionContext);

  if (!context) {
    throw new Error("useFilterFunctions must be used within a FilterProvider");
  }

  return context;
}

export function useFilter() {
  return { ...useFilterState(), ...useFilterAction(), ...useFilterFunctions() };
}
