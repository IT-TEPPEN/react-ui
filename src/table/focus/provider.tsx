import { createContext, useContext } from "react";
import { TFocusActionContext, TFocusStateContext } from "./types";
import { useFocusReducer } from "./hooks";

const FocusStateContext = createContext<TFocusStateContext>({
  isFocus: false,
});

const FocusActionContext = createContext<TFocusActionContext>({
  focus: () => {},
  unfocus: () => {},
  move: () => {},
  moveLeft: () => {},
  moveRight: () => {},
  moveUp: () => {},
  moveDown: () => {},
});

export function FocusProvider(props: { children: React.ReactNode }) {
  const { state, actions } = useFocusReducer();

  return (
    <FocusStateContext.Provider value={state}>
      <FocusActionContext.Provider value={actions}>
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
