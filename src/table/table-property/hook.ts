import { useCallback, useReducer } from "react";
import { TReturnTablePropertyReducer, TTablePropertyReducer } from "./type";

const reducer: TTablePropertyReducer = (state, action) => {
  switch (action.type) {
    case "setMaxDisplayRowCount":
      if (state.maxDisplayRowCount === action.payload.maxDisplayRowCount) {
        return state;
      }

      return {
        ...state,
        maxDisplayRowCount: action.payload.maxDisplayRowCount,
      };

    case "setMaxDisplayColCount":
      if (state.maxDisplayColCount === action.payload.maxDisplayColCount) {
        return state;
      }

      return {
        ...state,
        maxDisplayColCount: action.payload.maxDisplayColCount,
      };
  }
};

export function useTablePropertyReducer(): TReturnTablePropertyReducer {
  const [state, dispatch] = useReducer(reducer, {
    maxDisplayRowCount: 0,
    maxDisplayColCount: 0,
  });

  const setMaxDisplayRowCount = useCallback((maxDisplayRowCount: number) => {
    dispatch({
      type: "setMaxDisplayRowCount",
      payload: { maxDisplayRowCount },
    });
  }, []);

  const setMaxDisplayColCount = useCallback((maxDisplayColCount: number) => {
    dispatch({
      type: "setMaxDisplayColCount",
      payload: { maxDisplayColCount },
    });
  }, []);

  return {
    state,
    setMaxDisplayRowCount,
    setMaxDisplayColCount,
  };
}
