import { useEffect, useState } from "react";
import { useTablePropertyContext } from "../table/provider";

export function useRow(rowIndex: number) {
  const t = useTablePropertyContext();
  const [updateCount, setUpdateCount] = useState(0);
  const [returnValue, setReturnValue] = useState<{
    colLength: number;
    rowDesign: string;
    onClick: React.MouseEventHandler<HTMLDivElement>;
  }>({
    colLength: t.getColLength(),
    rowDesign: t.getRowDesign(rowIndex),
    onClick: (e) => {
      e.preventDefault();
      const onClickRow = t.getOnClickRow(rowIndex);
      onClickRow();

      if (t.getIsExistOnClickRow()) {
        t.unfocusCell();
      }
    },
  });

  const update = () => {
    setUpdateCount((prev) => prev + 1);
  };

  useEffect(() => {
    t.setUpdateRowFrameFunction(rowIndex, update);
    return () => {
      t.setUpdateRowFrameFunction(rowIndex, () => {});
    };
  }, []);

  useEffect(() => {
    const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();
      const onClickRow = t.getOnClickRow(rowIndex);
      onClickRow();

      if (t.getIsExistOnClickRow()) {
        t.unfocusCell();
      }
    };

    setReturnValue({
      colLength: t.getColLength(),
      rowDesign: t.getRowDesign(rowIndex),
      onClick,
    });
  }, [updateCount]);

  return returnValue;
}
