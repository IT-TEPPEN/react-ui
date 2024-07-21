"use client";

import { createContext, useContext, useEffect } from "react";
import { TReturnFocusReducer } from "./types";
import { useFocusReducer } from "./hooks";
import { usePageContext } from "../pagenation";
import { useProcessedDataContext } from "../sheet/providers";

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
  const focusStatus = useFocusReducer(
    to < rowCount ? to - from - 1 : rowCount - from - 1,
    props.columnCount - 1
  );
  const { rows } = useProcessedDataContext();

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!focusStatus.isFocus || focusStatus.isEditing) return;

      if (e.key === "Enter") {
        e.preventDefault();
        focusStatus.moveDown();
      } else if (e.key === "Escape") {
        e.preventDefault();
        focusStatus.unfocus();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusStatus.moveRight();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusStatus.moveLeft();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusStatus.moveUp();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        focusStatus.moveDown();
      } else if (e.key === "F2") {
        focusStatus.edit();
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [focusStatus.isEditing, focusStatus.isFocus]);

  useEffect(() => {
    focusStatus.setMaxRowNumber(rows.length - 1);
  }, [rows.length]);

  useEffect(() => {
    const onClickOutOfTable = (e: MouseEvent) => {
      const element = document.getElementById("table-frame");
      const ele = e.target;
      if (ele instanceof Node && element?.contains(ele)) return;
      focusStatus.unfocus();
    };

    document.addEventListener("click", onClickOutOfTable);

    return () => {
      document.removeEventListener("click", onClickOutOfTable);
    };
  }, [focusStatus.unfocus]);

  return (
    <FocusContext.Provider value={focusStatus}>
      {props.children}
    </FocusContext.Provider>
  );
}

export function useFocusContext() {
  return useContext(FocusContext);
}
