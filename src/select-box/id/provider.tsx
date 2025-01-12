import { createContext, useContext } from "react";

const IdContext = createContext<string>("");

export function IdProvider({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return <IdContext.Provider value={id}>{children}</IdContext.Provider>;
}

export function useIdContext() {
  return useContext(IdContext);
}
