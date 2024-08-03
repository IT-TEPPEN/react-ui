import { useCallback, useReducer } from "react";
import { TEditReducer, TReturnEditReducer } from "./types";

const reducer: TEditReducer = (state, action) => {
  switch (action.type) {
    case "startEditing":
      if (state.isEditing) return state;

      return {
        isEditing: true,
      };

    case "endEditing":
      if (!state.isEditing) return state;

      return {
        isEditing: false,
      };
  }
};

export function useEditReducer(): TReturnEditReducer {
  const [state, dispatch] = useReducer(reducer, {
    isEditing: false,
  });

  const startEditing = useCallback(() => {
    dispatch({ type: "startEditing" });
  }, []);

  const endEditing = useCallback(() => {
    dispatch({ type: "endEditing" });
  }, []);

  return {
    isEditing: state.isEditing,
    startEditing,
    endEditing,
  };
}
