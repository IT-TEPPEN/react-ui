import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  IIndex,
  TRangeReducer,
  IRangeConstraint,
  TRangeAction,
  TRangeActionContext,
  TRangeState,
  TReturnRangeReducer,
} from "./type";
import { useTableIdGenerator } from "../id";
import { measureCell, measureRange, TBox } from "./measure";

function newRangeConstraint(props: {
  maxColIndex: number;
  maxRowIndex: number;
}): IRangeConstraint {
  return {
    maxColIndex: props.maxColIndex < -1 ? -1 : props.maxColIndex,
    maxRowIndex: props.maxRowIndex < -1 ? -1 : props.maxRowIndex,
  };
}

function newIndex(props: {
  rowIndex: number;
  colIndex: number;
  constraint: IRangeConstraint;
}): IIndex {
  let rowIndex = props.rowIndex;
  let colIndex = props.colIndex;

  if (rowIndex < 0) {
    rowIndex = 0;
  } else if (props.constraint.maxRowIndex < rowIndex) {
    rowIndex = props.constraint.maxRowIndex;
  }

  if (colIndex < 0) {
    colIndex = 0;
  } else if (props.constraint.maxColIndex < colIndex) {
    colIndex = props.constraint.maxColIndex;
  }

  return { rowIndex, colIndex };
}

function equalIndex(a: IIndex, b: IIndex): boolean {
  return a.rowIndex === b.rowIndex && a.colIndex === b.colIndex;
}

/** Where a key moves a cell to (before it is kept inside the table). */
const STEPS = {
  Up: (i: IIndex) => ({ rowIndex: i.rowIndex - 1, colIndex: i.colIndex }),
  Down: (i: IIndex) => ({ rowIndex: i.rowIndex + 1, colIndex: i.colIndex }),
  Left: (i: IIndex) => ({ rowIndex: i.rowIndex, colIndex: i.colIndex - 1 }),
  Right: (i: IIndex) => ({ rowIndex: i.rowIndex, colIndex: i.colIndex + 1 }),
  Top: (i: IIndex) => ({ rowIndex: 0, colIndex: i.colIndex }),
  Bottom: (i: IIndex, c: IRangeConstraint) => ({
    rowIndex: c.maxRowIndex,
    colIndex: i.colIndex,
  }),
  LeftEnd: (i: IIndex) => ({ rowIndex: i.rowIndex, colIndex: 0 }),
  RightEnd: (i: IIndex, c: IRangeConstraint) => ({
    rowIndex: i.rowIndex,
    colIndex: c.maxColIndex,
  }),
} as const;

type TStep = keyof typeof STEPS;

function stepIndex(index: IIndex, step: TStep, constraint: IRangeConstraint) {
  return newIndex({ ...STEPS[step](index, constraint), constraint });
}

export const rangeReducer: TRangeReducer = (state, action) => {
  switch (action.type) {
    case "setMax":
      return {
        ...state,
        constraint: newRangeConstraint(action.payload),
      };

    // Mouse down on a cell: a new selection of that cell.
    case "startSelectRange": {
      const startIndex = newIndex({
        rowIndex: action.payload.rowIndex,
        colIndex: action.payload.colIndex,
        constraint: state.constraint,
      });

      if (
        state.isSelecting &&
        equalIndex(state.start, startIndex) &&
        equalIndex(state.end, startIndex) &&
        state.inProgress
      ) {
        return state;
      }

      return {
        ...state,
        isSelecting: true,
        inProgress: true,
        start: startIndex,
        end: startIndex,
      };
    }

    // Dragging: the end follows the mouse.
    case "moveSelectRange": {
      if (!state.isSelecting || !state.inProgress) {
        return state;
      }

      const endIndex = newIndex({
        rowIndex: action.payload.rowIndex,
        colIndex: action.payload.colIndex,
        constraint: state.constraint,
      });

      if (equalIndex(state.end, endIndex)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    // Mouse up: the selection stays.
    case "endSelectRange": {
      if (!state.isSelecting || !state.inProgress) {
        return state;
      }

      return {
        ...state,
        inProgress: false,
      };
    }

    // Arrow keys (with Ctrl: to the edge): select the one cell next to
    // the start of the selection.
    case "moveUp":
    case "moveDown":
    case "moveLeft":
    case "moveRight":
    case "moveTop":
    case "moveBottom":
    case "moveLeftEnd":
    case "moveRightEnd": {
      if (!state.isSelecting) {
        return state;
      }

      const step = action.type.slice("move".length) as TStep;
      const index = stepIndex(state.start, step, state.constraint);

      if (equalIndex(index, state.start) && equalIndex(index, state.end)) {
        return state;
      }

      return {
        ...state,
        start: index,
        end: index,
      };
    }

    // Shift + arrow keys (with Ctrl: to the edge): move the end of the
    // selection, keeping its start.
    case "extendUp":
    case "extendDown":
    case "extendLeft":
    case "extendRight":
    case "extendTop":
    case "extendBottom":
    case "extendLeftEnd":
    case "extendRightEnd": {
      if (!state.isSelecting) {
        return state;
      }

      const step = action.type.slice("extend".length) as TStep;
      const index = stepIndex(state.end, step, state.constraint);

      if (equalIndex(index, state.end)) {
        return state;
      }

      return {
        ...state,
        end: index,
      };
    }

    case "reset":
      return {
        constraint: state.constraint,
        isSelecting: false,
      };

    case "setRange":
      return {
        ...state,
        isSelecting: true,
        inProgress: false,
        start: action.payload.start,
        end: action.payload.end,
      };
  }
};

// Actions without a payload, one per key the table handles.
const KEY_ACTIONS = [
  "moveUp",
  "moveDown",
  "moveLeft",
  "moveRight",
  "moveTop",
  "moveBottom",
  "moveRightEnd",
  "moveLeftEnd",
  "extendUp",
  "extendDown",
  "extendLeft",
  "extendRight",
  "extendTop",
  "extendBottom",
  "extendRightEnd",
  "extendLeftEnd",
] as const;

type TKeyAction = (typeof KEY_ACTIONS)[number];

export function useRangeReducer(): TReturnRangeReducer {
  const IdGenerator = useTableIdGenerator();
  const [initialState] = useState<TRangeState>(() => ({
    constraint: newRangeConstraint({ maxColIndex: 0, maxRowIndex: 0 }),
    isSelecting: false,
  }));
  const [state, reactDispatch] = useReducer(rangeReducer, initialState);

  // The reducer is pure, so applying each action here as well gives the
  // state React will draw next, readable at once (see getSelection).
  const current = useRef(initialState);
  const dispatch = useMemo(
    () => (action: TRangeAction) => {
      current.current = rangeReducer(current.current, action);
      reactDispatch(action);
    },
    []
  );

  const actions = useMemo<TRangeActionContext>(() => {
    const keyActions = Object.fromEntries(
      KEY_ACTIONS.map((type) => [type, () => dispatch({ type })])
    ) as Record<TKeyAction, () => void>;

    return {
      ...keyActions,
      setMax: (payload) => dispatch({ type: "setMax", payload }),
      startSelectRange: (payload) =>
        dispatch({ type: "startSelectRange", payload }),
      moveSelectRange: (payload) =>
        dispatch({ type: "moveSelectRange", payload }),
      endSelectRange: () => dispatch({ type: "endSelectRange" }),
      reset: () => dispatch({ type: "reset" }),
      setRange: (payload) => dispatch({ type: "setRange", payload }),
      getSelection: () => {
        const selection = current.current;
        return selection.isSelecting
          ? { start: selection.start, end: selection.end }
          : null;
      },
    };
  }, []);

  useEffect(() => {
    const onClickOutOfTable = (e: MouseEvent) => {
      const element = document.getElementById(IdGenerator.getTableId());
      const ele = e.target;
      if (ele instanceof Node && element?.contains(ele)) return;
      dispatch({ type: "reset" });
    };

    document.addEventListener("mousedown", onClickOutOfTable);

    return () => {
      document.removeEventListener("mousedown", onClickOutOfTable);
    };
  }, []);

  // The selection with where its cells are on screen.
  const exState = useMemo<TReturnRangeReducer["state"]>(() => {
    if (!state.isSelecting) {
      return state;
    }

    const startBox = measureCell(IdGenerator, state.start);
    const endBox = measureCell(IdGenerator, state.end);
    const rangeBox = measureRange(IdGenerator, state.start, state.end);

    // The cells are gone (e.g. fewer rows after filtering).
    if (!startBox || !endBox || !rangeBox) {
      dispatch({ type: "reset" });
      return { isSelecting: false };
    }

    const toPoint = (index: IIndex, box: TBox) => ({
      ...index,
      xStart: box.left,
      xEnd: box.left + box.width,
      yStart: box.top,
      yEnd: box.top + box.height,
    });

    return {
      isSelecting: true,
      start: toPoint(state.start, startBox),
      end: toPoint(state.end, endBox),
      rangeBox,
    };
  }, [state]);

  return {
    state: exState,
    actions,
  };
}
