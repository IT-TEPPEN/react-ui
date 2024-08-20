import { useCallback, useReducer } from "react";
import { TReturnTablePropertyReducer, TTablePropertyReducer } from "./type";

const reducer: TTablePropertyReducer = (state, action) => {
  switch (action.type) {
    case "setMaxDisplayRowCount":
      return {
        ...state,
        maxDisplayRowCount: action.payload.maxDisplayRowCount,
      };

    case "setMaxDisplayColCount":
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

  const setMaxDisplayRowCount = useCallback(
    (maxDisplayRowCount: number) => {
      dispatch({
        type: "setMaxDisplayRowCount",
        payload: { maxDisplayRowCount },
      });
    },
    [dispatch]
  );

  const setMaxDisplayColCount = useCallback(
    (maxDisplayColCount: number) => {
      dispatch({
        type: "setMaxDisplayColCount",
        payload: { maxDisplayColCount },
      });
    },
    [dispatch]
  );

  return {
    maxDisplayRowCount: state.maxDisplayRowCount,
    maxDisplayColCount: state.maxDisplayColCount,
    setMaxDisplayRowCount,
    setMaxDisplayColCount,
  };
}
