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
   * startSelectRangeの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    /**
     * Actionが"start"で、前状態がisSelecting: falseの場合
     */
    [
      {
        isSelecting: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
      },
      { type: "startSelectRange", payload: { rowIndex: 2, colIndex: 1 } },
      {
        isSelecting: true,
        inProgress: true,
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
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 3 },
      },
      { type: "startSelectRange", payload: { rowIndex: 5, colIndex: 0 } },
      {
        isSelecting: true,
        inProgress: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 5, colIndex: 0 },
        end: { rowIndex: 5, colIndex: 0 },
      },
    ],
  ])("startの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * endSelectRangeの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: true,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "endSelectRange" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
    ],
  ])("endの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveUpの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveUp" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 1, colIndex: 1 },
        end: { rowIndex: 1, colIndex: 1 },
      },
    ],
  ])("moveUpの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveDownの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveDown" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 3, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 1 },
      },
    ],
  ])("moveDownの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveLeftの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveLeft" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 0 },
        end: { rowIndex: 2, colIndex: 0 },
      },
    ],
  ])("moveLeftの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * moveRightの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 1 },
      },
      { type: "moveRight" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 2 },
        end: { rowIndex: 2, colIndex: 2 },
      },
    ],
  ])("moveRightの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendUpの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 1 },
      },
      { type: "extendUp" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 1 },
      },
    ],
  ])("extendUpの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendDownの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 1 },
      },
      { type: "extendDown" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 5, colIndex: 1 },
      },
    ],
  ])("extendDownの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendLeftの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 3 },
      },
      { type: "extendLeft" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 2, colIndex: 2 },
      },
    ],
  ])("extendLeftの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * extendRightの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 2 },
      },
      { type: "extendRight" },
      {
        isSelecting: true,
        inProgress: false,
        constraint: { maxRowIndex: 10, maxColIndex: 3 },
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 3, colIndex: 3 },
      },
    ],
  ])("extendRightの正常系", (state, action, expectedState) => {
    expect(rangeReducer(state, action)).toEqual(expectedState);
  });

  /**
   * resetの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    [
      {
        isSelecting: true,
        inProgress: false,
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
