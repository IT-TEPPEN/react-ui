"use client";

import { createContext, useContext } from "react";
import { TReturnFocusReducer } from "./types";
import { useFocusReducer } from "./hooks";

const FocusContext = createContext<TReturnFocusReducer>({
  isEditing: false,
  checkFocus: function (): boolean {
    throw new Error("Function not implemented.");
  },
  focus: function (): void {
    throw new Error("Function not implemented.");
  },
  edit: function (): void {
    throw new Error("Function not implemented.");
  },
  move: function (): void {
    throw new Error("Function not implemented.");
  },
  moveLeft: function (): void {
    throw new Error("Function not implemented.");
  },
  moveRight: function (): void {
    throw new Error("Function not implemented.");
  },
  moveUp: function (): void {
    throw new Error("Function not implemented.");
  },
  moveDown: function (): void {
    throw new Error("Function not implemented.");
  },
  unfocus: function (): void {
    throw new Error("Function not implemented.");
  },
  setMaxRowNumber: function (): void {
    throw new Error("Function not implemented.");
  },
  setMaxColNumber: function (): void {
    throw new Error("Function not implemented.");
  },
});

export function FocusProvider(props: {
  children: React.ReactNode;
  maxRowNumber: number;
  maxColNumber: number;
}) {
  return (
    <FocusContext.Provider
      value={useFocusReducer(props.maxRowNumber, props.maxColNumber)}
    >
      {props.children}
    </FocusContext.Provider>
  );
}

export function useFocusContext() {
  return useContext(FocusContext);
}
