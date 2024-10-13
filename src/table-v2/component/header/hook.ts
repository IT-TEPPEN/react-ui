import { useEffect, useState } from "react";
import { useTablePropertyContext } from "../table/provider";

export function useHeaderElement(colIndex: number) {
  const ref = useTablePropertyContext();
  const [updateCount, setUpdateCount] = useState(0);
  const [returnValue, setReturnValue] = useState<{
    id: string;
    label: string;
  }>({
    id: ref.getColId(colIndex),
    label: ref.getColLabel(colIndex),
  });

  const update = () => {
    setUpdateCount((prev) => prev + 1);
  };

  useEffect(() => {
    ref.setUpdateColumnHeaderFunction(colIndex, update);
    return () => {
      ref.setUpdateColumnHeaderFunction(colIndex, () => {});
    };
  }, []);

  useEffect(() => {
    setReturnValue({
      id: ref.getColId(colIndex),
      label: ref.getColLabel(colIndex),
    });
  }, [updateCount]);

  return returnValue;
}
