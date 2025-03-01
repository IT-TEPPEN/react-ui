import { createContext, useContext } from "react";
import { TIdGeneratorContext } from "./type";

export const IdGeneratorContext = createContext<TIdGeneratorContext | null>(
  null
);

export function useIdGenerator() {
  const context = useContext(IdGeneratorContext);

  if (!context) {
    throw new Error("useIdGenerator must be used within a IdGeneratorProvider");
  }

  return context;
}
