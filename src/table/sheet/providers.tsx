"use client";

import { createContext, useContext } from "react";
import { DataObject, TCellEditingCondition, TTableColumn } from "../type";

const RowContext = createContext<DataObject>({
  id: "",
});

export function RowProvider({
  children,
  row,
}: {
  children: React.ReactNode;
  row: DataObject;
}) {
  return <RowContext.Provider value={row}>{children}</RowContext.Provider>;
}

export function useRowContext() {
  return useContext(RowContext);
}

const ColsContext = createContext<{
  [key: string]: { label?: string } & TCellEditingCondition;
}>({});

export function ColumnsProvider({
  children,
  cols,
}: {
  children: React.ReactNode;
  cols: TTableColumn[];
}) {
  const colsMap = cols.reduce((acc, col) => {
    const { key, ...other } = col;
    acc[key] = other;
    return acc;
  }, {} as { [key: string]: { label?: string } & TCellEditingCondition });

  return (
    <ColsContext.Provider value={colsMap}>{children}</ColsContext.Provider>
  );
}

export function useColumnContext(key: string) {
  return useContext(ColsContext)[key];
}

const CellContext = createContext<{
  columnKey: string;
  rowIndex: number;
  colIndex: number;
}>({
  columnKey: "",
  rowIndex: 0,
  colIndex: 0,
});

export function CellProvider({
  children,
  columnKey,
  rowIndex,
  colIndex,
}: {
  children: React.ReactNode;
  columnKey: string;
  rowIndex: number;
  colIndex: number;
}) {
  return (
    <CellContext.Provider value={{ columnKey, rowIndex, colIndex }}>
      {children}
    </CellContext.Provider>
  );
}

export function useCellContext() {
  return useContext(CellContext);
}
