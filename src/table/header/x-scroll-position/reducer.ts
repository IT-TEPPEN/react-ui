import { useMemo, useReducer } from "react";
import { TScrollXPositionHook, TScrollXPositionReducer } from "./type";

const scrollXPositionReducer: TScrollXPositionReducer = (state, action) => {
  switch (action.type) {
    case "set":
      if (action.payload.x === state.x) {
        return state;
      }

      if (action.payload.x < 0) {
        return state;
      }

      return {
        x: action.payload.x,
      };
  }
};

export const useScrollXPositionReducer: TScrollXPositionHook = (
  initialState
) => {
  const [state, dispatch] = useReducer(scrollXPositionReducer, {
    x: initialState || 0,
  });

  const action = useMemo(
    () => ({
      setScrollX: (x: number) => {
        dispatch({ type: "set", payload: { x } });
      },
    }),
    []
  );

  return { state, action };
};
