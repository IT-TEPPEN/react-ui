import { useCallback, useReducer } from "react";
import { TFocusReducer, TReturnFocusReducer } from "./types";

const reducer: TFocusReducer = (state, action) => {
  switch (action.type) {
    case "focus":
      if (
        state.isFocus &&
        state.rowNumber === action.payload.rowNumber &&
        state.colNumber === action.payload.colNumber
      ) {
        return state;
      }

      return {
        ...state,
        isEditing: false,
        rowNumber: action.payload.rowNumber,
        colNumber: action.payload.colNumber,
      };

    case "edit":
      if (!state.isFocus || state.isEditing) return state;

      return {
        ...state,
        isEditing: true,
      };

    case "move":
      if (
        !state.isFocus ||
        (state.rowNumber === action.payload.rowNumber &&
          state.colNumber === action.payload.colNumber)
      ) {
        return state;
      }

      return {
        ...state,
        isEditing: false,
        rowNumber: action.payload.rowNumber,
        colNumber: action.payload.colNumber,
      };

    case "moveLeft": {
      if (!state.isFocus) return state;

      const newColNumber = state.colNumber - 1;

      if (newColNumber < 0) return state;

      return {
        ...state,
        isEditing: false,
        colNumber: state.colNumber - 1,
      };
    }

    case "moveRight": {
      if (!state.isFocus) return state;

      const newColNumber = state.colNumber + 1;

      if (newColNumber > state.maxColNumber) return state;

      return {
        ...state,
        isEditing: false,
        colNumber: state.colNumber + 1,
      };
    }

    case "moveUp": {
      if (!state.isFocus) return state;

      const newRowNumber = state.rowNumber - 1;

      if (newRowNumber < 0) return state;

      return {
        ...state,
        isEditing: false,
        rowNumber: state.rowNumber - 1,
      };
    }

    case "moveDown": {
      if (!state.isFocus) return state;

      const newRowNumber = state.rowNumber + 1;

      if (newRowNumber > state.maxRowNumber) return state;

      return {
        ...state,
        isEditing: false,
        rowNumber: state.rowNumber + 1,
      };
    }

    case "unfocus":
      if (!state.isFocus) return state;

      return {
        maxColNumber: state.maxColNumber,
        maxRowNumber: state.maxRowNumber,
        isFocus: false,
      };

    case "setMaxRowNumber":
      if (state.maxRowNumber === action.payload.maxRowNumber) return state;

      return {
        ...state,
        maxRowNumber: action.payload.maxRowNumber,
      };

    case "setMaxColNumber":
      if (state.maxColNumber === action.payload.maxColNumber) return state;

      return {
        ...state,
        maxColNumber: action.payload.maxColNumber,
      };
  }
};

export function useFocusReducer(
  maxRowNumber: number,
  maxColNumber: number
): TReturnFocusReducer {
  const [state, dispatch] = useReducer(reducer, {
    maxRowNumber,
    maxColNumber,
    isFocus: false,
  });

  const checkFocus = useCallback(
    (rowNumber: number, colNumber: number) =>
      state.isFocus &&
      state.rowNumber === rowNumber &&
      state.colNumber === colNumber,
    [state]
  );

  const focus = useCallback(
    (rowNumber: number, colNumber: number) => {
      dispatch({ type: "focus", payload: { rowNumber, colNumber } });
    },
    [dispatch]
  );

  const edit = useCallback(() => {
    dispatch({ type: "edit" });
  }, [dispatch]);

  const move = useCallback(
    (rowNumber: number, colNumber: number) => {
      dispatch({ type: "move", payload: { rowNumber, colNumber } });
    },
    [dispatch]
  );

  const moveLeft = useCallback(() => {
    dispatch({ type: "moveLeft" });
  }, [dispatch]);

  const moveRight = useCallback(() => {
    dispatch({ type: "moveRight" });
  }, [dispatch]);

  const moveUp = useCallback(() => {
    dispatch({ type: "moveUp" });
  }, [dispatch]);

  const moveDown = useCallback(() => {
    dispatch({ type: "moveDown" });
  }, [dispatch]);

  const unfocus = useCallback(() => {
    dispatch({ type: "unfocus" });
  }, [dispatch]);

  const setMaxRowNumber = useCallback(
    (maxRowNumber: number) => {
      dispatch({ type: "setMaxRowNumber", payload: { maxRowNumber } });
    },
    [dispatch]
  );

  const setMaxColNumber = useCallback(
    (maxColNumber: number) => {
      dispatch({ type: "setMaxColNumber", payload: { maxColNumber } });
    },
    [dispatch]
  );

  return {
    isEditing: state.isFocus && state.isEditing,
    checkFocus,
    focus,
    edit,
    move,
    moveLeft,
    moveRight,
    moveUp,
    moveDown,
    unfocus,
    setMaxRowNumber,
    setMaxColNumber,
  };
}
