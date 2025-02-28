import { createContext, useContext } from "react";
import {
  TScrollXPositionActionContext,
  TScrollXPositionStateContext,
} from "./type";

export const ScrollXPositionStateContext =
  createContext<TScrollXPositionStateContext | null>(null);
export const ScrollXPositionActionContext =
  createContext<TScrollXPositionActionContext | null>(null);

export function useScrollXPositionState() {
  const context = useContext(ScrollXPositionStateContext);

  if (context === null) {
    throw new Error(
      "useScrollXPositionState must be used within a ScrollXPositionProvider"
    );
  }

  return context;
}

export function useScrollXPositionAction() {
  const context = useContext(ScrollXPositionActionContext);

  if (context === null) {
    throw new Error(
      "useScrollXPositionAction must be used within a ScrollXPositionProvider"
    );
  }

  return context;
}

export function useScrollXPosition() {
  return { ...useScrollXPositionState(), ...useScrollXPositionAction() };
}
