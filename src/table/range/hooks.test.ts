import { InvalidOperationError, OutOfRangeError } from "./errors";
import { rangeReducer } from "./hooks";
import { TRangeAction, TRangeState } from "./type";

describe("rangeReducer", () => {
  /**
   * setMaxの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      { isSelecting: false, constraint: { maxRowIndex: 5, maxColIndex: 5 } },
      { type: "setMax", payload: { maxRowIndex: 10, maxColIndex: 10 } },
      { isSelecting: false, constraint: { maxRowIndex: 10, maxColIndex: 10 } },
    ],
  ])("setMaxの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * setMaxの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      { isSelecting: false, constraint: { maxRowIndex: 5, maxColIndex: 5 } },
      { type: "setMax", payload: { maxRowIndex: -1, maxColIndex: 10 } },
    ],
    [
      { isSelecting: false, constraint: { maxRowIndex: 5, maxColIndex: 5 } },
      { type: "setMax", payload: { maxRowIndex: 10, maxColIndex: -1 } },
    ],
  ])("setMaxの異常系(OutOfRangeError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(OutOfRangeError);
  });

  /**
   * startの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    /**
     * Actionが"start"で、前状態がisSelecting: falseの場合
     */
    [
      { isSelecting: false, constraint: { maxRowIndex: 10, maxColIndex: 3 } },
      { type: "start", payload: { rowIndex: 2, colIndex: 1 } },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
    ],
    /**
     * Actionが"start"で、前状態がisSelecting: trueの場合
     */
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 3 },
      },
      { type: "start", payload: { rowIndex: 5, colIndex: 0 } },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 5, colIndex: 0 },
        end: { rowIndex: 5, colIndex: 0 },
      },
    ],
  ])("startの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * startの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    /**
     * Actionが"start"で、payloadのrowIndexが-1の場合
     */
    [
      { isSelecting: false, constraint: { maxRowIndex: 10, maxColIndex: 3 } },
      { type: "start", payload: { rowIndex: -1, colIndex: 0 } },
    ],
    /**
     * Actionが"start"で、payloadのcolIndexが-1の場合
     */
    [
      { isSelecting: false, constraint: { maxRowIndex: 10, maxColIndex: 3 } },
      { type: "start", payload: { rowIndex: 0, colIndex: -1 } },
    ],
    /**
     * Actionが"start"で、payloadのrowIndexがmaxRowIndex以上の場合
     */
    [
      { isSelecting: false, constraint: { maxRowIndex: 10, maxColIndex: 3 } },
      { type: "start", payload: { rowIndex: 11, colIndex: 0 } },
    ],
    /**
     * Actionが"start"で、payloadのcolIndexがmaxColIndex以上の場合
     */
    [
      { isSelecting: false, constraint: { maxRowIndex: 10, maxColIndex: 3 } },
      { type: "start", payload: { rowIndex: 0, colIndex: 4 } },
    ],
  ])("startの異常系(OutOfRangeError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(OutOfRangeError);
  });

  /**
   * endの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "end", payload: { rowIndex: 4, colIndex: 2 } },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 2 },
      },
    ],
  ])("endの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * endの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "end", payload: { rowIndex: 4, colIndex: 2 } },
    ],
  ])("endの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * moveUpの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveUp" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 1, colIndex: 1 },
        end: { rowIndex: 1, colIndex: 1 },
      },
    ],
  ])("moveUpの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveUpの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "moveUp" },
    ],
  ])("moveUpの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * moveDownの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveDown" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 3, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 1 },
      },
    ],
  ])("moveDownの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveDownの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "moveDown" },
    ],
  ])("moveDownの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * moveLeftの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveLeft" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 0 },
        end: { rowIndex: 2, colIndex: 0 },
      },
    ],
  ])("moveLeftの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveLeftの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "moveLeft" },
    ],
  ])("moveLeftの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * moveRightの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveRight" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 2 },
        end: { rowIndex: 2, colIndex: 2 },
      },
    ],
  ])("moveRightの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveRightの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "moveRight" },
    ],
  ])("moveRightの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * extendUpの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 1 },
      },
      { type: "extendUp" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 1 },
      },
    ],
  ])("extendUpの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendUpの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "extendUp" },
    ],
  ])("extendUpの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * extendDownの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 1 },
      },
      { type: "extendDown" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 5, colIndex: 1 },
      },
    ],
  ])("extendDownの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendDownの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "extendDown" },
    ],
  ])("extendDownの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * extendLeftの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 3 },
      },
      { type: "extendLeft" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 2 },
      },
    ],
  ])("extendLeftの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendLeftの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "extendLeft" },
    ],
  ])("extendLeftの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * extendRightの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 2 },
      },
      { type: "extendRight" },
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 3 },
      },
    ],
  ])("extendRightの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendRightの異常系
   */
  test.each<[TRangeState, TRangeAction]>([
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "extendRight" },
    ],
  ])("extendRightの異常系(InvalidOperationError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(
      InvalidOperationError
    );
  });

  /**
   * resetの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "reset" },
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
    ],
  ])("resetの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });
});
