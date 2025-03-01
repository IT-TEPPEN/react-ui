import { createContext, useContext } from "react";
import {
  TConditionInputActionContext,
  TConditionInputStateContext,
} from "./type";

export const ConditionInputStateContext =
  createContext<TConditionInputStateContext | null>(null);

export const ConditionInputActionContext =
  createContext<TConditionInputActionContext | null>(null);

export function useConditionInputState() {
  const context = useContext(ConditionInputStateContext);

  if (!context) {
    throw new Error(
      "useConditionInputState must be used within a ConditionInputProvider"
    );
  }

  return context;
}

export function useConditionInputAction() {
  const context = useContext(ConditionInputActionContext);

  if (!context) {
    throw new Error(
      "useConditionInputAction must be used within a ConditionInputProvider"
    );
  }

  return context;
}

export function useConditionInput() {
  return {
    state: useConditionInputState(),
    actions: useConditionInputAction(),
  };
}
