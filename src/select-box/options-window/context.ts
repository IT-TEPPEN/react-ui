import { createContext, useContext } from "react";
import {
  TOptionsWindowActionContext,
  TOptionsWindowStateContext,
} from "./type";

export const OptionsWindowStateContext =
  createContext<TOptionsWindowStateContext | null>(null);

export const OptionsWindowActionContext =
  createContext<TOptionsWindowActionContext | null>(null);

export const useOptionsWindowState = () => {
  const optionsState = useContext(OptionsWindowStateContext);

  if (optionsState === null) {
    throw new Error(
      "useOptionsWindowState must be used within a SelectOptionsWindowProvider"
    );
  }
  return optionsState;
};

export const useOptionsWindowActions = () => {
  const optionsActions = useContext(OptionsWindowActionContext);

  if (optionsActions === null) {
    throw new Error(
      "useOptionsWindowActions must be used within a SelectOptionsWindowProvider"
    );
  }

  return optionsActions;
};

export const useOptionsWindow = () => {
  return {
    state: useOptionsWindowState(),
    actions: useOptionsWindowActions(),
  };
};
