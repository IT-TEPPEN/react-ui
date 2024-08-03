import { createContext, useCallback, useContext, useMemo } from "react";
import { TColumnType } from "../type";
import { useColumnContext, useRowContext } from "../sheet";
import { useEditActionContext } from "../edit/provider";

const CellIndexContext = createContext<{
  rowIndex: number;
  colIndex: number;
}>({
  rowIndex: 0,
  colIndex: 0,
});

const CellEditableContext = createContext<boolean>(false);

const CellContext = createContext<{
  columnKey: string;
  value: any;
  label: any;
  type: TColumnType | "component";
  component?: React.ReactNode;
  updateCellValue: (value: string) => void;
}>({
  columnKey: "",
  value: "",
  label: "",
  type: "string",
  updateCellValue: () => {},
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
  const col = useColumnContext(columnKey);
  const row = useRowContext();
  // const { checkFocus } = useFocusContext();
  const value = row[columnKey];
  const { endEditing } = useEditActionContext();

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

  const cellIndexState = useMemo(
    () => ({ rowIndex, colIndex }),
    [rowIndex, colIndex]
  );

  const updateCellValue = useCallback(
    (value: string) => {
      if (col.editable) {
        if (col.type === "number") {
          col.onCellBlur(columnKey, Number(value), row, endEditing);
        } else {
          col.onCellBlur(columnKey, value, row, endEditing);
        }
      }
    },
    [col, columnKey, row]
  );

  const type: TColumnType | "component" =
    !col.editable && col.render ? "component" : col.type;

  const cellStatus = useMemo(
    () => ({
      columnKey,
      value,
      label,
      component,
      type,
      updateCellValue,
    }),
    [columnKey, value, label, component, col, updateCellValue]
  );

  return (
    <CellIndexContext.Provider value={cellIndexState}>
      <CellEditableContext.Provider value={col.editable ?? false}>
        <CellContext.Provider value={cellStatus}>
          {children}
        </CellContext.Provider>
      </CellEditableContext.Provider>
    </CellIndexContext.Provider>
  );
}

export function useCellIndexContext() {
  return useContext(CellIndexContext);
}

export function useCellEditableContext() {
  return useContext(CellEditableContext);
}

export function useCellContext() {
  return useContext(CellContext);
}
