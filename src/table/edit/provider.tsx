"use client";

import { createContext, useContext, useMemo } from "react";
import { TReturnEditReducer } from "./types";
import { useEditReducer } from "./hooks";

const EditStateContext = createContext<Pick<TReturnEditReducer, "isEditing">>({
  isEditing: false,
});

const EditActionContext = createContext<
  Pick<TReturnEditReducer, "startEditing" | "endEditing">
>({
  startEditing: () => {},
  endEditing: () => {},
});

export function EditProvider(props: { children: React.ReactNode }) {
  const edit = useEditReducer();

  const state: Pick<TReturnEditReducer, "isEditing"> = useMemo(
    () => ({
      isEditing: edit.isEditing,
    }),
    [edit.isEditing]
  );

  const action: Pick<TReturnEditReducer, "startEditing" | "endEditing"> =
    useMemo(
      () => ({
        startEditing: edit.startEditing,
        endEditing: edit.endEditing,
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
