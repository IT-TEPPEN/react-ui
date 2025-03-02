import {
  OptionsWindowActionContext,
  OptionsWindowStateContext,
} from "./context";
import { useOptionsWindowHook } from "./hook";

export function SelectOptionsWindowProvider(props: {
  children: React.ReactNode;
}) {
  const { state, actions } = useOptionsWindowHook();

  return (
    <OptionsWindowStateContext.Provider value={state}>
      <OptionsWindowActionContext.Provider value={actions}>
        {props.children}
      </OptionsWindowActionContext.Provider>
    </OptionsWindowStateContext.Provider>
  );
}
