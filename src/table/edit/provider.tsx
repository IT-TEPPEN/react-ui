"use client";

import { createContext, useContext, useMemo, useRef } from "react";
import { TReturnEditReducer } from "./types";
import { useEditReducer } from "./hooks";

const EditStateContext = createContext<Pick<TReturnEditReducer, "isEditing">>({
  isEditing: false,
});

/** Where the selection moves after a cell is committed with Enter / Tab. */
export type TMoveAfterEditing = "up" | "down" | "left" | "right";

type TEditActions = Pick<TReturnEditReducer, "startEditing" | "endEditing"> & {
  /**
   * Remembers where to move once editing ends (null forgets it). The move
   * happens only if editing actually ends, e.g. not when validation fails.
   */
  setMoveAfterEditing: (move: TMoveAfterEditing | null) => void;
  /** Returns the remembered move and forgets it. */
  takeMoveAfterEditing: () => TMoveAfterEditing | null;
};

const EditActionContext = createContext<TEditActions>({
  startEditing: () => {},
  endEditing: () => {},
  setMoveAfterEditing: () => {},
  takeMoveAfterEditing: () => null,
});

export function EditProvider(props: { children: React.ReactNode }) {
  const edit = useEditReducer();

  const state: Pick<TReturnEditReducer, "isEditing"> = useMemo(
    () => ({
      isEditing: edit.isEditing,
    }),
    [edit.isEditing]
  );

  const moveRef = useRef<TMoveAfterEditing | null>(null);

  const action: TEditActions = useMemo(
    () => ({
      startEditing: () => {
        moveRef.current = null;
        edit.startEditing();
      },
      endEditing: edit.endEditing,
      setMoveAfterEditing: (move) => {
        moveRef.current = move;
      },
      takeMoveAfterEditing: () => {
        const move = moveRef.current;
        moveRef.current = null;
        return move;
      },
    }),
    []
  );

  return (
    <EditStateContext.Provider value={state}>
      <EditActionContext.Provider value={action}>
        {props.children}
      </EditActionContext.Provider>
    </EditStateContext.Provider>
  );
}

export function useEditContext() {
  return { ...useEditStateContext(), ...useEditActionContext() };
}

export function useEditStateContext() {
  return useContext(EditStateContext);
}

export function useEditActionContext() {
  return useContext(EditActionContext);
}
