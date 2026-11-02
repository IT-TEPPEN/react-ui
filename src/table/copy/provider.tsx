import { createContext, useContext } from "react";
import { TCopyActionContext, TCopyStateContext } from "./types";
import { useCopyReducer } from "./hooks";

const CopyStateContext = createContext<TCopyStateContext>({
  copiedAt: new Date(),
});

const CopyActionContext = createContext<TCopyActionContext>({
  copy: () => {},
});

export function CopyProvider({
  children,
}: {
  children: React.JSX.Element | React.JSX.Element[];
}) {
  const { states, actions } = useCopyReducer();
  return (
    <CopyStateContext.Provider value={states}>
      <CopyActionContext.Provider value={actions}>
        {children}
      </CopyActionContext.Provider>
    </CopyStateContext.Provider>
  );
}

export function useCopyStateContext() {
  return useContext(CopyStateContext);
}

export function useCopyActionContext() {
  return useContext(CopyActionContext);
}
