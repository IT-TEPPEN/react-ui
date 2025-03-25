import { useEffect, useMemo, useReducer } from "react";
import {
  IIndex,
  TRangeReducer,
  IRangeConstraint,
  TReturnRangeReducer,
} from "./type";
import { useTableIdGenerator } from "../id";

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

const MOVE_ACTION = {
  UP: { deltaRow: -1, deltaCol: 0 },
  DOWN: { deltaRow: 1, deltaCol: 0 },
  LEFT: { deltaRow: 0, deltaCol: -1 },
  RIGHT: { deltaRow: 0, deltaCol: 1 },
} as const;

type TMoveAction = keyof typeof MOVE_ACTION;

function moveIndex({
  index,
  direction,
  constraint,
}: {
  index: IIndex;
  direction: TMoveAction;
  constraint: IRangeConstraint;
}): IIndex {
  const { deltaRow, deltaCol } = MOVE_ACTION[direction];

  const newRow = index.rowIndex + deltaRow;
  const newCol = index.colIndex + deltaCol;

  return newIndex({
    rowIndex: newRow,
    colIndex: newCol,
    constraint,
  });
}

export const rangeReducer: TRangeReducer = (state, action) => {
  switch (action.type) {
    /**
     * Actionが"setMax"の場合の説明:
     * - Actionのtypeが"setMax"の場合、選択範囲の最大値を設定します。
     * - payloadのmaxRowIndexとmaxColIndexが範囲外の場合、OutOfRangeErrorをスローします。
     * - 範囲内の場合、constraintを新しい範囲制約に設定します。
     */
    case "setMax":
      return {
        ...state,
        constraint: newRangeConstraint(action.payload),
      };

    /**
     * Actionが"start"の場合の説明:
     * - Actionのtypeが"start"の場合、選択範囲の開始位置を設定します。
     * - payloadのrowIndexとcolIndexが範囲外の場合、OutOfRangeErrorをスローします。
     * - 範囲内の場合、isSelectingをtrueに設定し、startとendの位置をpayloadの位置に設定します。
     */
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

    /**
     * Actionが"end"の場合の説明:
     * - Actionのtypeが"end"の場合、選択範囲の終了位置を設定します。
     * - payloadのrowIndexとcolIndexが範囲外の場合、OutOfRangeErrorをスローします。
     * - 範囲内の場合、endの位置をpayloadの位置に設定します。
     * - この場合、isSelectingはtrueのままです。
     */
    case "endSelectRange": {
      if (!state.isSelecting || !state.inProgress) {
        return state;
      }

      return {
        ...state,
        inProgress: false,
      };
    }

    /**
     * Actionが"moveUp"の場合の説明:
     * - Actionのtypeが"moveUp"の場合、選択範囲を上に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を1つ上に移動します。
     */
    case "moveUp": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = moveIndex({
        index: state.start,
        direction: "UP",
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"moveDown"の場合の説明:
     * - Actionのtypeが"moveDown"の場合、選択範囲を下に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を1つ下に移動します。
     */
    case "moveDown": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = moveIndex({
        index: state.start,
        direction: "DOWN",
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"moveLeft"の場合の説明:
     * - Actionのtypeが"moveLeft"の場合、選択範囲を左に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を1つ左に移動します。
     */
    case "moveLeft": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = moveIndex({
        index: state.start,
        direction: "LEFT",
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"moveRight"の場合の説明:
     * - Actionのtypeが"moveRight"の場合、選択範囲を右に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を1つ右に移動します。
     */
    case "moveRight": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = moveIndex({
        index: state.start,
        direction: "RIGHT",
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"moveTop"の場合の説明:
     * - Actionのtypeが"moveTop"の場合、選択範囲を一番上に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、startとendの位置を一番上に設定します。
     */
    case "moveTop": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = newIndex({
        rowIndex: 0,
        colIndex: state.start.colIndex,
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"moveBottom"の場合の説明:
     * - Actionのtypeが"moveBottom"の場合、選択範囲を一番下に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、startとendの位置を一番下に設定します。
     */
    case "moveBottom": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = newIndex({
        rowIndex: state.constraint.maxRowIndex,
        colIndex: state.start.colIndex,
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"moveRightEnd"の場合の説明:
     * - Actionのtypeが"moveRightEnd"の場合、選択範囲を一番右に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、startとendの位置を一番右に設定します。
     */
    case "moveLeftEnd": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = newIndex({
        rowIndex: state.start.rowIndex,
        colIndex: 0,
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"moveRightEnd"の場合の説明:
     * - Actionのtypeが"moveRightEnd"の場合、選択範囲を一番右に移動します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、startとendの位置を一番右に設定します。
     */
    case "moveRightEnd": {
      if (!state.isSelecting) {
        return state;
      }

      const startIndex = newIndex({
        rowIndex: state.start.rowIndex,
        colIndex: state.constraint.maxColIndex,
        constraint: state.constraint,
      });

      if (
        equalIndex(startIndex, state.start) &&
        equalIndex(startIndex, state.end)
      ) {
        return state;
      }

      return {
        ...state,
        start: startIndex,
        end: startIndex,
      };
    }

    /**
     * Actionが"extendUp"の場合の説明:
     * - Actionのtypeが"extendUp"の場合、選択範囲を上に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を1つ上に拡張します。
     */
    case "extendUp": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = moveIndex({
        index: state.end,
        direction: "UP",
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"extendDown"の場合の説明:
     * - Actionのtypeが"extendDown"の場合、選択範囲を下に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を1つ下に拡張します。
     */
    case "extendDown": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = moveIndex({
        index: state.end,
        direction: "DOWN",
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"extendLeft"の場合の説明:
     * - Actionのtypeが"extendLeft"の場合、選択範囲を左に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を1つ左に拡張します。
     */
    case "extendLeft": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = moveIndex({
        index: state.end,
        direction: "LEFT",
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"extendRight"の場合の説明:
     * - Actionのtypeが"extendRight"の場合、選択範囲を右に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     *  - それ以外の場合、endの位置を1つ右に拡張します。
     */
    case "extendRight": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = moveIndex({
        index: state.end,
        direction: "RIGHT",
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"extendTop"の場合の説明:
     * - Actionのtypeが"extendTop"の場合、選択範囲を一番上に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を一番上に拡張します。
     */
    case "extendTop": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = newIndex({
        rowIndex: 0,
        colIndex: state.end.colIndex,
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"extendBottom"の場合の説明:
     * - Actionのtypeが"extendBottom"の場合、選択範囲を一番下に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を一番下に拡張します。
     */
    case "extendBottom": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = newIndex({
        rowIndex: state.constraint.maxRowIndex,
        colIndex: state.end.colIndex,
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"extendRightEnd"の場合の説明:
     * - Actionのtypeが"extendRightEnd"の場合、選択範囲を一番右に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を一番右に拡張します。
     */
    case "extendLeftEnd": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = newIndex({
        rowIndex: state.end.rowIndex,
        colIndex: 0,
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"extendRightEnd"の場合の説明:
     * - Actionのtypeが"extendRightEnd"の場合、選択範囲を一番右に拡張します。
     * - isSelectingがfalseの場合、InvalidOperationErrorをスローします。
     * - 移動後の位置がstartとendが同じ場合、stateをそのまま返します。
     * - それ以外の場合、endの位置を一番右に拡張します。
     */
    case "extendRightEnd": {
      if (!state.isSelecting) {
        return state;
      }

      const endIndex = newIndex({
        rowIndex: state.end.rowIndex,
        colIndex: state.constraint.maxColIndex,
        constraint: state.constraint,
      });

      if (equalIndex(endIndex, state.end)) {
        return state;
      }

      return {
        ...state,
        end: endIndex,
      };
    }

    /**
     * Actionが"reset"の場合の説明:
     * - Actionのtypeが"reset"の場合、選択範囲をリセットします。
     * - isSelectingをfalseに設定します。
     */
    case "reset":
      return {
        constraint: state.constraint,
        isSelecting: false,
      };

    /**
     * Actionが"setRange"の場合の説明:
     * - Actionのtypeが"setRange"の場合、選択範囲を設定します。
     * - payloadのstartとendの位置を設定します。
     */
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

export function useRangeReducer(): TReturnRangeReducer {
  const IdGenerator = useTableIdGenerator();
  const [state, dispatch] = useReducer(rangeReducer, {
    constraint: newRangeConstraint({ maxColIndex: 0, maxRowIndex: 0 }),
    isSelecting: false,
  });

  const actions = useMemo(
    () => ({
      setMax: (payload: { maxRowIndex: number; maxColIndex: number }) => {
        dispatch({ type: "setMax", payload });
      },
      startSelectRange: (payload: { rowIndex: number; colIndex: number }) => {
        dispatch({ type: "startSelectRange", payload });
      },
      moveSelectRange: (payload: { rowIndex: number; colIndex: number }) => {
        dispatch({ type: "moveSelectRange", payload });
      },
      endSelectRange: () => {
        dispatch({ type: "endSelectRange" });
      },
      moveUp: () => {
        dispatch({ type: "moveUp" });
      },
      moveDown: () => {
        dispatch({ type: "moveDown" });
      },
      moveLeft: () => {
        dispatch({ type: "moveLeft" });
      },
      moveRight: () => {
        dispatch({ type: "moveRight" });
      },
      moveTop: () => {
        dispatch({ type: "moveTop" });
      },
      moveBottom: () => {
        dispatch({ type: "moveBottom" });
      },
      moveRightEnd: () => {
        dispatch({ type: "moveRightEnd" });
      },
      moveLeftEnd: () => {
        dispatch({ type: "moveLeftEnd" });
      },
      extendUp: () => {
        dispatch({ type: "extendUp" });
      },
      extendDown: () => {
        dispatch({ type: "extendDown" });
      },
      extendLeft: () => {
        dispatch({ type: "extendLeft" });
      },
      extendRight: () => {
        dispatch({ type: "extendRight" });
      },
      extendTop: () => {
        dispatch({ type: "extendTop" });
      },
      extendBottom: () => {
        dispatch({ type: "extendBottom" });
      },
      extendRightEnd: () => {
        dispatch({ type: "extendRightEnd" });
      },
      extendLeftEnd: () => {
        dispatch({ type: "extendLeftEnd" });
      },
      reset: () => {
        dispatch({ type: "reset" });
      },
      setRange: (payload: { start: IIndex; end: IIndex }) => {
        dispatch({ type: "setRange", payload });
      },
    }),
    []
  );

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

  const exState = useMemo<TReturnRangeReducer["state"]>(() => {
    if (!state.isSelecting) {
      return state;
    }

    const startElement = document.getElementById(
      IdGenerator.getTableCellId({
        rowIndex: state.start.rowIndex,
        columnIndex: state.start.colIndex,
      })
    );
    const endElement = document.getElementById(
      IdGenerator.getTableCellId({
        rowIndex: state.end.rowIndex,
        columnIndex: state.end.colIndex,
      })
    );
    const tableElement = document.getElementById(IdGenerator.getTableId());

    if (!startElement || !endElement || !tableElement) {
      dispatch({ type: "reset" });
      return { isSelecting: false };
    }

    const startRect = startElement.getBoundingClientRect();
    const endRect = endElement.getBoundingClientRect();
    const rectTable = tableElement.getBoundingClientRect();

    const adjustSize = {
      y: rectTable.top - tableElement.scrollTop,
      x: rectTable.left - tableElement.scrollLeft,
    };

    const startDivProps = {
      top: startRect.top - adjustSize.y,
      left: startRect.left - adjustSize.x,
      width: startRect.width,
      height: startRect.height,
    };

    const endDivProps = {
      top: endRect.top - adjustSize.y,
      left: endRect.left - adjustSize.x,
      width: endRect.width,
      height: endRect.height,
    };

    return {
      isSelecting: true,
      start: {
        ...state.start,
        xStart: startDivProps.left,
        xEnd: startDivProps.left + startDivProps.width,
        yStart: startDivProps.top,
        yEnd: startDivProps.top + startDivProps.height,
      },
      end: {
        ...state.end,
        xStart: endDivProps.left,
        xEnd: endDivProps.left + endDivProps.width,
        yStart: endDivProps.top,
        yEnd: endDivProps.top + endDivProps.height,
      },
      rangeBox: {
        top: Math.min(startDivProps.top, endDivProps.top),
        left: Math.min(startDivProps.left, endDivProps.left),
        width:
          Math.abs(startDivProps.left - endDivProps.left) +
          (startDivProps.left <= endDivProps.left
            ? endDivProps.width
            : startDivProps.width),
        height:
          Math.abs(startDivProps.top - endDivProps.top) +
          (startDivProps.top <= endDivProps.top
            ? endDivProps.height
            : startDivProps.height),
      },
    };
  }, [state]);

  return {
    state: exState,
    actions,
  };
}
