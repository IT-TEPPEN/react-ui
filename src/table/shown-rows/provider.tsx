import { createContext, useContext, useRef } from "react";
import { DataObject, DataRecord } from "../table/type";

type TShownRows = { current: DataObject<DataRecord>[] };

const ShownRowsContext = createContext<TShownRows>({ current: [] });

/**
 * Holds the rows on the current page, in the order shown. The table sets
 * them after each render; copy and paste read them when they run, so a
 * change of rows does not re-render anything.
 */
export function ShownRowsProvider(props: { children: React.ReactNode }) {
  const rows = useRef<DataObject<DataRecord>[]>([]);
  return (
    <ShownRowsContext.Provider value={rows}>
      {props.children}
    </ShownRowsContext.Provider>
  );
}

export function useShownRows(): TShownRows {
  return useContext(ShownRowsContext);
}
