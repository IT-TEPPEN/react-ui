import { OutOfRangeError } from "./errors";
import { TRangeReducer } from "./type";

export const rangeReducer: TRangeReducer = (state, action) => {
  switch (action.type) {
    case "setMax":
      return {
        ...state,
        maxRowIndex: action.payload.maxRowIndex,
        maxColIndex: action.payload.maxColIndex,
      };

    /**
     * Actionが"start"の場合の説明:
     * - Actionのtypeが"start"の場合、選択範囲の開始位置を設定します。
     * - payloadのrowIndexとcolIndexが範囲外の場合、OutOfRangeErrorをスローします。
     * - 範囲内の場合、isSelectingをtrueに設定し、startとendの位置をpayloadの位置に設定します。
     */
    case "start":
      if (action.payload.rowIndex < 0) {
        throw new OutOfRangeError(
          "001",
          "rowIndex must be 0 or greater",
          `The provided rowIndex (${action.payload.rowIndex}) is out of range. It must be 0 or greater.`
        );
      }
      if (state.maxRowIndex < action.payload.rowIndex) {
        throw new OutOfRangeError(
          "002",
          "rowIndex must be less than maxRowIndex",
          `The provided rowIndex (${action.payload.rowIndex}) is out of range. It must be less than ${state.maxRowIndex}.`
        );
      }
      if (action.payload.colIndex < 0) {
        throw new OutOfRangeError(
          "003",
          "colIndex must be 0 or greater",
          `The provided colIndex (${action.payload.colIndex}) is out of range. It must be 0 or greater.`
        );
      }
      if (state.maxColIndex < action.payload.colIndex) {
        throw new OutOfRangeError(
          "004",
          "colIndex must be less than maxColIndex",
          `The provided colIndex (${action.payload.colIndex}) is out of range. It must be less than ${state.maxColIndex}.`
        );
      }

      return {
        ...state,
        isSelecting: true,
        start: {
          rowIndex: action.payload.rowIndex,
          colIndex: action.payload.colIndex,
        },
        end: {
          rowIndex: action.payload.rowIndex,
          colIndex: action.payload.colIndex,
        },
      };
    case "end":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        isSelecting: false,
        start: state.start,
        end: {
          rowIndex: action.payload.rowIndex,
          colIndex: action.payload.colIndex,
        },
      };
    case "moveUp":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        end: {
          rowIndex: state.end.rowIndex - 1,
          colIndex: state.end.colIndex,
        },
      };
    case "moveDown":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        end: {
          rowIndex: state.end.rowIndex + 1,
          colIndex: state.end.colIndex,
        },
      };
    case "moveLeft":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        end: {
          rowIndex: state.end.rowIndex,
          colIndex: state.end.colIndex - 1,
        },
      };
    case "moveRight":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        end: {
          rowIndex: state.end.rowIndex,
          colIndex: state.end.colIndex + 1,
        },
      };
    case "extendUp":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        start: {
          rowIndex: state.start.rowIndex - 1,
          colIndex: state.start.colIndex,
        },
      };
    case "extendDown":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        start: {
          rowIndex: state.start.rowIndex + 1,
          colIndex: state.start.colIndex,
        },
      };
    case "extendLeft":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        start: {
          rowIndex: state.start.rowIndex,
          colIndex: state.start.colIndex - 1,
        },
      };
    case "extendRight":
      if (!state.isSelecting) {
        return state;
      }

      return {
        ...state,
        start: {
          rowIndex: state.start.rowIndex,
          colIndex: state.start.colIndex + 1,
        },
      };
    case "reset":
      return {
        maxColIndex: state.maxColIndex,
        maxRowIndex: state.maxRowIndex,
        isSelecting: false,
      };
    default:
      return state;
  }
};
