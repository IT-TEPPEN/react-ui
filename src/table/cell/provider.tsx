import { createContext, useContext, useMemo } from "react";
import { TColumnType } from "../type";
import { useColumnContext, useRowContext } from "../sheet";

const CellContext = createContext<{
  type: TColumnType | "component";
  component?: React.ReactNode;
}>({
  type: "string",
});

export function CellProvider({
  children,
  columnKey,
}: {
  children: React.ReactNode;
  columnKey: string;
}) {
  const col = useColumnContext(columnKey);
  const row = useRowContext();
  const value = row[columnKey];

  const label =
    col.type === "select"
      ? col.options?.find((op) => op.value === value)?.label
      : value;

  const component = useMemo(() => {
    if (col.editable) {
      return label;
    } else {
      return col.render ? col.render(value as never, row) : label;
    }
  }, [col.editable, label, value, row]);

  const type: TColumnType | "component" =
    !col.editable && col.render ? "component" : col.type;

  const cellStatus = useMemo(
    () => ({
      component,
      type,
    }),
    [type, component]
  );

  return (
    <CellContext.Provider value={cellStatus}>{children}</CellContext.Provider>
  );
}

export function useCellContext() {
  return useContext(CellContext);
}
