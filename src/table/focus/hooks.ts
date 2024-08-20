import { useCallback, useEffect, useReducer } from "react";
import { TFocusReducer, TReturnFocusReducer } from "./types";
import { IdGenerator } from "../libs";

const reducer: TFocusReducer = (state, action) => {
  switch (action.type) {
    case "focus":
      if (state.isFocus) {
        return state;
      }

      return {
        isFocus: true,
        rowIndex: action.payload.rowIndex,
        colIndex: action.payload.colIndex,
      };
    case "unfocus":
      if (!state.isFocus) {
        return state;
      }

      return {
        isFocus: false,
      };
    case "move":
      if (!state.isFocus) {
        return state;
      }

      return {
        isFocus: true,
        rowIndex: action.payload.rowIndex,
        colIndex: action.payload.colIndex,
      };
    case "moveLeft":
      if (!state.isFocus) {
        return state;
      }

      return {
        ...state,
        colIndex: state.colIndex - 1,
      };
    case "moveRight":
      if (!state.isFocus) {
        return state;
      }

      return {
        ...state,
        colIndex: state.colIndex + 1,
      };
    case "moveUp":
      if (!state.isFocus) {
        return state;
      }

      return {
        ...state,
        rowIndex: state.rowIndex - 1,
      };
    case "moveDown":
      if (!state.isFocus) {
        return state;
      }

      return {
        ...state,
        rowIndex: state.rowIndex + 1,
      };
  }
};

export function useFocusReducer(): TReturnFocusReducer {
  const [state, dispatch] = useReducer(reducer, {
    isFocus: false,
  });

  const focus = useCallback((rowIndex: number, colIndex: number) => {
    dispatch({ type: "focus", payload: { rowIndex, colIndex } });
  }, []);

  const unfocus = useCallback(() => {
    dispatch({ type: "unfocus" });
  }, []);

  const move = useCallback((rowIndex: number, colIndex: number) => {
    dispatch({ type: "move", payload: { rowIndex, colIndex } });
  }, []);

  const moveLeft = useCallback(() => {
    dispatch({ type: "moveLeft" });
  }, []);

  const moveRight = useCallback(() => {
    dispatch({ type: "moveRight" });
  }, []);

  const moveUp = useCallback(() => {
    dispatch({ type: "moveUp" });
  }, []);

  const moveDown = useCallback(() => {
    dispatch({ type: "moveDown" });
  }, []);

  useEffect(() => {
    const onClickOutOfTable = (e: MouseEvent) => {
      const element = document.getElementById("table-frame");
      const ele = e.target;
      if (ele instanceof Node && element?.contains(ele)) return;
      unfocus();
    };

    document.addEventListener("click", onClickOutOfTable);

    return () => {
      document.removeEventListener("click", onClickOutOfTable);
    };
  }, []);

  useEffect(() => {
    if (state.isFocus) {
      const element = document.getElementById(
        IdGenerator.getTableCellId(state.rowIndex, state.colIndex)
      );
      element?.style.setProperty("outline-style", "solid");
      element?.style.setProperty("outline-width", "1px");
      element?.style.setProperty("outline-offset", "-1px");
      element?.style.setProperty("outline-color", "#9ca3af");

      element?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
      element?.focus();
    }

    return () => {
      if (state.isFocus) {
        const element = document.getElementById(
          IdGenerator.getTableCellId(state.rowIndex, state.colIndex)
        );
        element?.style.setProperty("outline-style", "none");
      }
    };
  }, [state]);

  if (state.isFocus) {
    return {
      isFocus: true,
      rowIndex: state.rowIndex,
      colIndex: state.colIndex,
      focus,
      unfocus,
      move,
      moveLeft,
      moveRight,
      moveUp,
      moveDown,
    };
  } else {
    return {
      isFocus: false,
      focus,
      unfocus,
      move,
      moveLeft,
      moveRight,
      moveUp,
      moveDown,
    };
  }
}
