import { createContext, useContext, useEffect } from "react";
import { TRangeActionContext, TRangeStateContext } from "./type";
import { NoImplementeFunction } from "../lib/errors";
import { useRangeReducer } from "./hooks";
import { useTablePropertyStateContext } from "../table-property/provider";

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
  extendUp: NoImplementeFunction,
  extendDown: NoImplementeFunction,
  extendLeft: NoImplementeFunction,
  extendRight: NoImplementeFunction,
  reset: NoImplementeFunction,
});

export function useRangeStateContext() {
  return useContext(RangeStateContext);
}

export function useRangeActionContext() {
  return useContext(RangeActionContext);
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

export function TestRange() {
  const state = useRangeStateContext();

  if (!state.isSelecting) {
    return <></>;
  }

  const { rangeBox } = state;

  return (
    <div
      style={{
        position: "absolute",
        top: rangeBox.top,
        left: rangeBox.left,
        width: rangeBox.width,
        height: rangeBox.height,
        border: "1px solid blue",
        pointerEvents: "none",
      }}
    ></div>
  );
}

export function RangeProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const { state, actions } = useRangeReducer();

  console.log(state);

  return (
    <RangeStateContext.Provider value={state}>
      <RangeActionContext.Provider value={actions}>
        <EffectSetMax />
        {children}
      </RangeActionContext.Provider>
    </RangeStateContext.Provider>
  );
}
