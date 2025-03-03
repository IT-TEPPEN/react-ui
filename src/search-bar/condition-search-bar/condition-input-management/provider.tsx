import {
  ConditionInputActionContext,
  ConditionInputStateContext,
} from "./context";
import { useConditionInputHook } from "./hook";
import { Target, TConditionChangeAction } from "./type";

export function ConditionInputProvider(props: {
  children: React.ReactNode;
  targets: Target[];
  onChangeCondition: (action: TConditionChangeAction) => void;
}) {
  const { state, actions } = useConditionInputHook(
    props.targets,
    props.onChangeCondition
  );

  return (
    <ConditionInputStateContext.Provider value={state}>
      <ConditionInputActionContext.Provider value={actions}>
        {props.children}
      </ConditionInputActionContext.Provider>
    </ConditionInputStateContext.Provider>
  );
}
