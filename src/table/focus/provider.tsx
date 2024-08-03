import { createContext, useContext, useMemo } from "react";
import { TFocusState, TReturnFocusReducer } from "./types";
import { useFocusReducer } from "./hooks";

const FocusStateContext = createContext<TFocusState>({
  isFocus: false,
});

const FocusActionContext = createContext<
  Omit<TReturnFocusReducer, "isFocus" | "rowIndex" | "colIndex">
>({
  focus: () => {},
  unfocus: () => {},
  move: () => {},
  moveLeft: () => {},
  moveRight: () => {},
  moveUp: () => {},
  moveDown: () => {},
});

export function FocusProvider(props: { children: React.ReactNode }) {
  const focus = useFocusReducer();

  const state: TFocusState = focus.isFocus
    ? {
        isFocus: true,
        rowIndex: focus.rowIndex,
        colIndex: focus.colIndex,
      }
    : {
        isFocus: false,
      };

  const action: Omit<TReturnFocusReducer, "isFocus" | "rowIndex" | "colIndex"> =
    useMemo(() => {
      return {
        focus: focus.focus,
        unfocus: focus.unfocus,
        move: focus.move,
        moveLeft: focus.moveLeft,
        moveRight: focus.moveRight,
        moveUp: focus.moveUp,
        moveDown: focus.moveDown,
      };
    }, []);

  return (
    <FocusStateContext.Provider value={state}>
      <FocusActionContext.Provider value={action}>
        {props.children}
      </FocusActionContext.Provider>
    </FocusStateContext.Provider>
  );
}

export function useFocusStateContext() {
  return useContext(FocusStateContext);
}

export function useFocusActionContext() {
  return useContext(FocusActionContext);
}

export function useFocusContext() {
  return { ...useFocusStateContext(), ...useFocusActionContext() };
}
