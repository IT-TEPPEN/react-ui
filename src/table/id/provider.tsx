import { createContext, useContext, useId, useMemo } from "react";
import { ITableIdGenerator } from "./interface";
import { IdGenerator } from "./id-generator";

const TableIdContext = createContext<ITableIdGenerator | null>(null);

export function TableIdGeneratorProvider(props: {
  id?: string;
  children: React.ReactNode;
}) {
  // Without an id, each table still needs unique element ids so that several
  // tables on one page do not find each other's cells.
  const autoId = useId();
  const id = props.id ?? autoId;
  const generator = useMemo(() => new IdGenerator(id), [id]);

  return (
    <TableIdContext.Provider value={generator}>
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
