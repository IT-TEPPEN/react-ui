import { useCallback, useState } from "react";
import { useColumnsWidth } from "./columns-width";

export function useResizeColWidthHook(keyName: string) {
  const { getColumnWidth, getColumnMinWidth, setColWidth } = useColumnsWidth();
  const [isDragging, setIsDragging] = useState(false);

  const colWidth = getColumnWidth(keyName);
  const minWidth = getColumnMinWidth(keyName);

  const cursorStyle = "col-resize";

  const onMouseDownResizeWidth: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        if (isDragging) return;

        const startX = e.clientX;
        const startWidth = colWidth;

        document.body.style.cursor = cursorStyle;
        document.body.style.userSelect = "none";

        const onMouseMove = (moveEvent: MouseEvent) => {
          setIsDragging(true);
          const newWidth = startWidth + (moveEvent.clientX - startX);
          setColWidth(keyName, newWidth > minWidth ? newWidth : minWidth);
        };

        const onMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          document.body.style.cursor = "default";
          document.body.style.userSelect = "auto";
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      },
      [isDragging, minWidth]
    );

  return {
    onMouseDownResizeWidth,
  };
}
