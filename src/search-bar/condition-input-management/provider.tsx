import {
  ConditionInputActionContext,
  ConditionInputStateContext,
} from "./context";
import { useConditionInputHook } from "./hook";
import { Target } from "./type";

export function ConditionInputProvider(props: {
  children: React.ReactNode;
  targets: Target[];
}) {
  const { state, actions } = useConditionInputHook(props.targets);

  return (
    <ConditionInputStateContext.Provider value={state}>
      <ConditionInputActionContext.Provider value={actions}>
        {props.children}
      </ConditionInputActionContext.Provider>
    </ConditionInputStateContext.Provider>
  );
}
