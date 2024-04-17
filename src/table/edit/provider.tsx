"use client";

import { createContext, useContext } from "react";
import { TReturnFocusReducer } from "./types";
import { useFocusReducer } from "./hooks";
import { usePageContext } from "../pagenation";

const FocusContext = createContext<TReturnFocusReducer>({
  isEditing: false,
  isFocus: false,
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
  focusAndEdit: function (): void {
    throw new Error("Function not implemented.");
  },
  finishEditing: function (): void {
    throw new Error("Function not implemented.");
  },
});

export function FocusProvider(props: {
  children: React.ReactNode;
  columnCount: number;
}) {
  const { from, to, rowCount } = usePageContext();

  return (
    <FocusContext.Provider
      value={useFocusReducer(
        to < rowCount ? to - from - 1 : rowCount - from - 1,
        props.columnCount - 1
      )}
    >
      {props.children}
    </FocusContext.Provider>
  );
}

export function useFocusContext() {
  return useContext(FocusContext);
}
