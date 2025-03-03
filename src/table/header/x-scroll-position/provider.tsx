import {
  ScrollXPositionActionContext,
  ScrollXPositionStateContext,
} from "./context";
import { useScrollXPositionReducer } from "./reducer";

export function ScrollXPositionProvider(props: {
  children: React.ReactNode;
  initialState?: number;
}) {
  const { state, action } = useScrollXPositionReducer(props.initialState);

  return (
    <ScrollXPositionStateContext.Provider value={state}>
      <ScrollXPositionActionContext.Provider value={action}>
        {props.children}
      </ScrollXPositionActionContext.Provider>
    </ScrollXPositionStateContext.Provider>
  );
}
