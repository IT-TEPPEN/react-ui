"use client";

import { DEFAULT_COL_WIDTH, DEFAULT_MIN_COL_WIDTH } from "../../constant";
import { DataRecord, TTableColumn } from "../../table/type";
import { ColumnsWidthActionContext, ColumnsWidthStateContext } from "./context";
import { useColumnsWidthReducer } from "./reducer";
import { TColumnsWidthHook } from "./type";

export function ColumnsWidthProvider(props: {
  children: React.ReactNode;
  initialState: TTableColumn<DataRecord>[];
}) {
  const { state, action } = useColumnsWidthReducer(
    convertToColumnsWidthState(props.initialState)
  );

  return (
    <ColumnsWidthStateContext.Provider value={state}>
      <ColumnsWidthActionContext.Provider value={action}>
        {props.children}
      </ColumnsWidthActionContext.Provider>
    </ColumnsWidthStateContext.Provider>
  );
}

const convertToColumnsWidthState = (
  cols: TTableColumn<DataRecord>[]
): Parameters<TColumnsWidthHook>[0] => {
  return cols.reduce((acc, col, i) => {
    acc[col.key] = {
      colWidth: col.initialWidth || DEFAULT_COL_WIDTH,
      minWidth: col.minWidth || DEFAULT_MIN_COL_WIDTH,
      index: i,
    };

    return acc;
  }, {} as any);
};
