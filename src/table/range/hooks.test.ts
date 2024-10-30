import { OutOfRangeError } from "./errors";
import { rangeReducer } from "./hooks";
import { TRangeAction, TRangeState } from "./type";

describe("rangeReducer", () => {
  /**
   * startの正常系
   */
  test.each<[TRangeState, TRangeAction, TRangeState]>([
    /**
     * Actionが"start"で、前状態がisSelecting: falseの場合
     */
    [
      { isSelecting: false, maxRowIndex: 10, maxColIndex: 3 },
      { type: "start", payload: { rowIndex: 2, colIndex: 1 } },
      {
        isSelecting: true,
        maxRowIndex: 10,
        maxColIndex: 3,
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
        maxRowIndex: 10,
        maxColIndex: 3,
        start: { rowIndex: 2, colIndex: 1 },
        end: { rowIndex: 4, colIndex: 3 },
      },
      { type: "start", payload: { rowIndex: 5, colIndex: 0 } },
      {
        isSelecting: true,
        maxRowIndex: 10,
        maxColIndex: 3,
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
      { isSelecting: false, maxRowIndex: 10, maxColIndex: 3 },
      { type: "start", payload: { rowIndex: -1, colIndex: 0 } },
    ],
    /**
     * Actionが"start"で、payloadのcolIndexが-1の場合
     */
    [
      { isSelecting: false, maxRowIndex: 10, maxColIndex: 3 },
      { type: "start", payload: { rowIndex: 0, colIndex: -1 } },
    ],
    /**
     * Actionが"start"で、payloadのrowIndexがmaxRowIndex以上の場合
     */
    [
      { isSelecting: false, maxRowIndex: 10, maxColIndex: 3 },
      { type: "start", payload: { rowIndex: 11, colIndex: 0 } },
    ],
    /**
     * Actionが"start"で、payloadのcolIndexがmaxColIndex以上の場合
     */
    [
      { isSelecting: false, maxRowIndex: 10, maxColIndex: 3 },
      { type: "start", payload: { rowIndex: 0, colIndex: 4 } },
    ],
  ])("startの異常系(OutOfRangeError)", (prevState, action) => {
    expect(() => rangeReducer(prevState, action)).toThrow(OutOfRangeError);
  });
});
