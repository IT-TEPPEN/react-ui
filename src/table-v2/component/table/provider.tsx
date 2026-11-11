import { createContext, useContext } from "react";
import { ITable } from "../../interface/table";
import { CTable } from "../../class/table";
import { DataRecord, TPropsTable } from "./type";
import { useTableProperty } from "./hook";

const TablePropertyContext = createContext<React.MutableRefObject<ITable>>({
  current: new CTable({ rows: [], cols: [] }),
});

interface TPropsTablePropertyProvider {
  property: TPropsTable<DataRecord>;
  children: JSX.Element | JSX.Element[];
}

export function TablePropertyProvider({
  property,
  children,
}: TPropsTablePropertyProvider) {
  return (
    <TablePropertyContext.Provider value={useTableProperty(property)}>
      {children}
    </TablePropertyContext.Provider>
  );
}

export function useTablePropertyContext() {
  return useContext(TablePropertyContext).current;
}
