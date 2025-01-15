import { createContext, useContext } from "react";
import { ITableIdGenerator } from "./interface";
import { IdGenerator } from "./id-generator";

const TableIdContext = createContext<ITableIdGenerator | null>(null);

export function TableIdGeneratorProvider(props: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <TableIdContext.Provider value={new IdGenerator(props.id)}>
      {props.children}
    </TableIdContext.Provider>
  );
}

export function useTableIdGenerator() {
  const context = useContext(TableIdContext);

  if (!context) {
    throw new Error(
      "useTableIdGenerator must be used within TableIdGeneratorProvider"
    );
  }

  return context;
}
