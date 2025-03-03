import { Reducer } from "react";

type TScrollXPositionState = {
  x: number;
};

type TScrollXPositionAction = {
  type: "set";
  payload: {
    x: number;
  };
};

export type TScrollXPositionReducer = Reducer<
  TScrollXPositionState,
  TScrollXPositionAction
>;

export type TScrollXPositionStateContext = TScrollXPositionState;
export type TScrollXPositionActionContext = {
  setScrollX: (x: number) => void;
};

export type TScrollXPositionHook = (initialState?: number) => {
  state: TScrollXPositionStateContext;
  action: TScrollXPositionActionContext;
};
