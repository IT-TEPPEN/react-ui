import { useEffect, useRef } from "react";
import { ITable } from "../../interface/table";
import { CTable } from "../../class/table";
import { DataRecord, TPropsTable } from "./type";

export function useTableProperty(property: TPropsTable<DataRecord>) {
  const refTableProperty = useRef<ITable>(new CTable(property));

  useEffect(() => {
    refTableProperty.current.refreshData(property.rows);
  }, [property.rows]);

  return refTableProperty;
}
