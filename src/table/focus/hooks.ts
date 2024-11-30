import { useEffect, useMemo, useReducer } from "react";
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

  const actions = useMemo(
    () => ({
      focus: (rowIndex: number, colIndex: number) => {
        dispatch({ type: "focus", payload: { rowIndex, colIndex } });
      },
      unfocus: () => {
        dispatch({ type: "unfocus" });
      },
      move: (rowIndex: number, colIndex: number) => {
        dispatch({ type: "move", payload: { rowIndex, colIndex } });
      },
      moveLeft: () => {
        dispatch({ type: "moveLeft" });
      },
      moveRight: () => {
        dispatch({ type: "moveRight" });
      },
      moveUp: () => {
        dispatch({ type: "moveUp" });
      },
      moveDown: () => {
        dispatch({ type: "moveDown" });
      },
    }),
    []
  );

  useEffect(() => {
    const onClickOutOfTable = (e: MouseEvent) => {
      const element = document.getElementById(IdGenerator.getTableId());
      const ele = e.target;
      if (ele instanceof Node && element?.contains(ele)) return;
      actions.unfocus();
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

  return {
    state,
    actions,
  };
}
