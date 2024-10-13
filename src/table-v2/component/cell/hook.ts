import { useEffect, useState } from "react";
import { useTablePropertyContext } from "../table/provider";

export function useCell(rowIndex: number, colIndex: number) {
  const t = useTablePropertyContext();
  const [updateCount, setUpdateCount] = useState(0);
  const [returnValue, setReturnValue] = useState<{
    component: React.ReactNode;
  }>({ component: t.getCellComponent(rowIndex, colIndex) });

  const update = () => {
    setUpdateCount((prev) => prev + 1);
  };

  useEffect(() => {
    t.setUpdateCellDataFunction(rowIndex, colIndex, update);
    return () => {
      t.setUpdateCellDataFunction(rowIndex, colIndex, () => {});
    };
  }, []);

  useEffect(() => {
    setReturnValue({
      component: t.getCellComponent(rowIndex, colIndex),
    });
  }, [updateCount]);

  return returnValue;
}

export function useCellFrame(rowIndex: number, colIndex: number) {
  const t = useTablePropertyContext();
  const [updateCount, setUpdateCount] = useState(0);
  const [returnValue, setReturnValue] = useState<{
    id: string;
    type: "string" | "number" | "select" | "component";
    design: string;
    editable: boolean;
    isExistOnClickRow: boolean;
    onClickCell: React.MouseEventHandler<HTMLDivElement>;
    onDoubleClick: React.MouseEventHandler<HTMLDivElement>;
  }>({
    id: t.getCellId(rowIndex, colIndex),
    editable: t.getColEditable(colIndex),
    design: t.getCellDesign(rowIndex, colIndex),
    isExistOnClickRow: t.getIsExistOnClickRow(),
    type: t.getColType(colIndex),
    onClickCell: (e) => {
      e.preventDefault();
      e.stopPropagation();
      t.focusCell(rowIndex, colIndex);
    },
    onDoubleClick: (e) => {
      e.preventDefault();
      t.switchToEditMode({ rowIndex, colIndex });
    },
  });

  const update = () => {
    setUpdateCount((prev) => prev + 1);
  };

  useEffect(() => {
    t.setUpdateCellFrameFunction(rowIndex, colIndex, update);
    return () => {
      t.setUpdateCellFrameFunction(rowIndex, colIndex, () => {});
    };
  }, []);

  useEffect(() => {
    const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      t.switchToEditMode({ rowIndex, colIndex });
    };

    const onClickCell: React.MouseEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      e.stopPropagation();
      t.focusCell(rowIndex, colIndex);
    };

    setReturnValue({
      id: t.getCellId(rowIndex, colIndex),
      type: t.getColType(colIndex),
      design: t.getCellDesign(rowIndex, colIndex),
      isExistOnClickRow: t.getIsExistOnClickRow(),
      editable: t.getColEditable(colIndex),
      onClickCell,
      onDoubleClick,
    });
  }, [updateCount]);

  return returnValue;
}
