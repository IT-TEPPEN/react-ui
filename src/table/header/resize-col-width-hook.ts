import { useCallback, useState } from "react";
import { DEFAULT_COL_WIDTH, DEFAULT_MIN_COL_WIDTH } from "../constant";

export function useResizeColWidthHook(options?: {
  initialWidth?: number;
  minWidth?: number;
}) {
  const [colWidth, setColWidth] = useState(
    options?.initialWidth ?? DEFAULT_COL_WIDTH
  );

  const cursorStyle = "col-resize";

  const onMouseDownResizeWidth: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        const startX = e.clientX;
        const startWidth = colWidth;

        document.body.style.cursor = cursorStyle;
        document.body.style.userSelect = "none";

        const onMouseMove = (moveEvent: MouseEvent) => {
          const newWidth = startWidth + (moveEvent.clientX - startX);
          setColWidth(
            newWidth > (options?.minWidth ?? DEFAULT_MIN_COL_WIDTH)
              ? newWidth
              : options?.minWidth ?? DEFAULT_MIN_COL_WIDTH
          );
        };

        const onMouseUp = () => {
          document.removeEventListener("mousemove", onMouseMove);
          document.removeEventListener("mouseup", onMouseUp);
          document.body.style.cursor = "default";
          document.body.style.userSelect = "auto";
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      },
      [colWidth, options?.minWidth]
    );

  return {
    colWidth,
    onMouseDownResizeWidth,
  };
}
