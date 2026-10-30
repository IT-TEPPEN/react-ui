import { Condition } from "../../search-bar";
import {
  FilterActionContext,
  FilterFunctionContext,
  FilterStateContext,
} from "./context";
import { useFilterHook } from "./hook";
import { TFilterMode } from "./type";

export function FilterProvider(props: {
  children: React.ReactNode;
  initialConditions: Condition[];
  initialMode?: TFilterMode;
}) {
  const { state, actions, functions } = useFilterHook(
    props.initialConditions,
    props.initialMode
  );

  return (
    <FilterStateContext.Provider value={state}>
      <FilterActionContext.Provider value={actions}>
        <FilterFunctionContext.Provider value={functions}>
          {props.children}
        </FilterFunctionContext.Provider>
      </FilterActionContext.Provider>
    </FilterStateContext.Provider>
  );
}
