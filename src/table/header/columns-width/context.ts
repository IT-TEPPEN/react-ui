import { createContext, useContext } from "react";
import { TColumnsWidthActionContext, TColumnsWidthStateContext } from "./type";

export const ColumnsWidthStateContext =
  createContext<TColumnsWidthStateContext | null>(null);

export const ColumnsWidthActionContext =
  createContext<TColumnsWidthActionContext | null>(null);

export function useColumnsWidthState() {
  const context = useContext(ColumnsWidthStateContext);

  if (context === null) {
    throw new Error(
      "useColumnsWidthState must be used within a ColumnsWidthProvider"
    );
  }

  return context;
}

export function useColumnsWidthAction() {
  const context = useContext(ColumnsWidthActionContext);

  if (context === null) {
    throw new Error(
      "useColumnsWidthAction must be used within a ColumnsWidthProvider"
    );
  }

  return context;
}

export function useColumnsWidth() {
  return { ...useColumnsWidthState(), ...useColumnsWidthAction() };
}
