import { useEffect, useState } from "react";
import { useCopyStateContext } from "./provider";
import { useTableIdGenerator } from "../id";
import { useMessages } from "../locale/provider";

export function CopiedMessage() {
  const IdGenerator = useTableIdGenerator();
  const [isDisplay, setIsDisplay] = useState(false);
  const { copiedAt } = useCopyStateContext();
  const messages = useMessages();

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
      className={`fixed z-[100] p-1 bg-[color:var(--teppen-table-toast-bg,#1f2937)] duration-300 pointer-events-none ${
        isDisplay ? "opacity-100" : "opacity-0"
      }`}
      style={{ top: y, left: x }}
    >
      <p className="text-[color:var(--teppen-table-toast-text,#ffffff)] text-xs">{messages.copied}</p>
    </div>
  );
}
