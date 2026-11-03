import { createContext, useContext, useEffect } from "react";
import { TRangeActionContext, TRangeStateContext } from "./type";
import { NoImplementeFunction } from "../lib/errors";
import { useRangeReducer } from "./hooks";
import { useTablePropertyStateContext } from "../table-property/provider";
import { useTableIdGenerator } from "../id";
import { useScrollXPosition } from "../header/x-scroll-position";
import { measureRange } from "./measure";
import { useColumnsContext } from "../sheet/providers";

const RangeStateContext = createContext<TRangeStateContext>({
  isSelecting: false,
});

const RangeActionContext = createContext<TRangeActionContext>({
  setMax: NoImplementeFunction,
  startSelectRange: NoImplementeFunction,
  moveSelectRange: NoImplementeFunction,
  endSelectRange: NoImplementeFunction,
  moveUp: NoImplementeFunction,
  moveDown: NoImplementeFunction,
  moveLeft: NoImplementeFunction,
  moveRight: NoImplementeFunction,
  moveTop: NoImplementeFunction,
  moveBottom: NoImplementeFunction,
  moveRightEnd: NoImplementeFunction,
  moveLeftEnd: NoImplementeFunction,
  extendUp: NoImplementeFunction,
  extendDown: NoImplementeFunction,
  extendLeft: NoImplementeFunction,
  extendRight: NoImplementeFunction,
  extendTop: NoImplementeFunction,
  extendBottom: NoImplementeFunction,
  extendRightEnd: NoImplementeFunction,
  extendLeftEnd: NoImplementeFunction,
  reset: NoImplementeFunction,
  setRange: NoImplementeFunction,
  getSelection: () => null,
});

export function useRangeStateContext() {
  return useContext(RangeStateContext);
}

export function useRangeActionContext() {
  return useContext(RangeActionContext);
}

export function useRangeContext() {
  return { ...useRangeStateContext(), ...useRangeActionContext() };
}

function EffectSetMax() {
  const { setMax } = useRangeActionContext();
  const { maxDisplayRowCount, maxDisplayColCount } =
    useTablePropertyStateContext();

  useEffect(() => {
    setMax({
      maxRowIndex: maxDisplayRowCount - 1,
      maxColIndex: maxDisplayColCount - 1,
    });
  }, [maxDisplayRowCount, maxDisplayColCount]);

  return <></>;
}

export function TestRange(props: { isCopied?: boolean }) {
  const IdGenerator = useTableIdGenerator();
  const state = useRangeStateContext();
  const cols = useColumnsContext();
  // Re-measure while scrolling sideways: pinned cells stay put.
  useScrollXPosition();

  useEffect(() => {
    if (state.isSelecting) {
      const endElement = document.getElementById(
        IdGenerator.getTableCellId({
          rowIndex: state.end.rowIndex,
          columnIndex: state.end.colIndex,
        })
      );

      if (endElement) {
        endElement.scrollIntoView({
          behavior: "instant",
          block: "nearest",
          inline: "nearest",
        });
        endElement.focus();
      }
    }
  }, [state]);

  if (!state.isSelecting) {
    return <></>;
  }

  const { start, end } = state;
  // One cell of a read-only column: a gray frame, as it cannot be edited.
  const readOnly =
    start.rowIndex === end.rowIndex &&
    start.colIndex === end.colIndex &&
    !cols[start.colIndex]?.editable;
  const rangeBox = measureRange(IdGenerator, start, end) ?? state.rangeBox;

  const clickboxPoint = {
    x: start.xEnd < end.xEnd ? end.xEnd : start.xEnd,
    y: start.yEnd < end.yEnd ? end.yEnd : start.yEnd,
  };

  return (
    <>
      <div
        data-teppen-part="selection"
        data-read-only={readOnly ? "" : undefined}
        className={`absolute z-[3] border ${
          readOnly
            ? "border-[color:var(--teppen-table-selection-readonly-border,#6b7280)]"
            : "border-[color:var(--teppen-table-selection-border,#2459d6)] bg-[color:var(--teppen-table-selection-bg,rgb(36_89_214/0.08))]"
        } ${
          props.isCopied ? "border-dashed" : "border-solid"
        }`}
        style={{
          top: rangeBox.top,
          left: rangeBox.left,
          width: rangeBox.width,
          height: rangeBox.height,
          pointerEvents: "none",
        }}
      ></div>
      {/* <div
        className="absolute bg-gray-700"
        style={{
          top: clickboxPoint.y - 5,
          left: clickboxPoint.x - 5,
          width: 10,
          height: 10,
          pointerEvents: "none",
        }}
      /> */}
    </>
  );
}

export function RangeProvider({
  children,
}: {
  children: React.JSX.Element | React.JSX.Element[];
}) {
  const { state, actions } = useRangeReducer();

  return (
    <RangeStateContext.Provider value={state}>
      <RangeActionContext.Provider value={actions}>
        <EffectSetMax />
        {children}
      </RangeActionContext.Provider>
    </RangeStateContext.Provider>
  );
}
