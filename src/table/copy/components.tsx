import { useEffect, useState } from "react";
import { useCopyStateContext } from "./provider";
import { IdGenerator } from "../libs";

export function CopiedMessage() {
  const [isDisplay, setIsDisplay] = useState(false);
  const { copiedAt } = useCopyStateContext();

  useEffect(() => {
    if (copiedAt) {
      setIsDisplay(true);

      const timer = setTimeout(() => {
        setIsDisplay(false);
      }, 1000);

      return () => {
        setIsDisplay(false);
        clearTimeout(timer);
      };
    }
  }, [copiedAt]);

  if (!isDisplay) {
    return <></>;
  }

  const tableElement = document.getElementById(IdGenerator.getTableId());

  if (!tableElement) {
    return <></>;
  }

  // テーブルの右下の位置を取得
  const rect = tableElement.getBoundingClientRect();
  const x = rect.right - 120;
  const y = rect.bottom - 50;

  return (
    <div
      className={`fixed z-[100] p-1 bg-gray-800 duration-300 pointer-events-none ${
        isDisplay ? "opacity-100" : "opacity-0"
      }`}
      style={{ top: y, left: x }}
    >
      <p className="text-white text-xs">コピーしました!!!</p>
    </div>
  );
}
