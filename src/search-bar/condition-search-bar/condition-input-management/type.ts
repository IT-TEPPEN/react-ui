import { Reducer } from "react";
import {
  MULTI_SELECT,
  NONE,
  RANGE_DATE,
  RANGE_NUMBER,
  RANGE_STRING,
  SELECT,
  SINGLE_DATE,
  SINGLE_DATETIME,
  SINGLE_NUMBER,
  SINGLE_STRING,
  T_DEFAULT_SEARCH_OPERATOR,
} from "../../../share/search-operator/constant";
import { Options } from "../../../select-box";

export type Target = {
  key: string;
  label: string;
} & (
  | {
      type: "string" | "number" | "date" | "datetime";
    }
  | {
      type: "select";
      options: Options[];
    }
);

export type SearchInput =
  | {
      type: typeof NONE;
    }
  | {
      type: typeof SINGLE_STRING;
      payload: {
        value: string;
      };
    }
  | {
      type: typeof SINGLE_NUMBER;
      payload: {
        value: number;
      };
    }
  | {
      type: typeof SINGLE_DATE;
      payload: {
        value: Date;
      };
    }
  | {
      type: typeof RANGE_STRING;
      payload: {
        from: string;
        to: string;
      };
    }
  | {
      type: typeof RANGE_NUMBER;
      payload: {
        from: number;
        to: number;
      };
    }
  | {
      type: typeof RANGE_DATE;
      payload: {
        from: string;
        to: string;
      };
    }
  | {
      type: typeof SELECT;
      payload: {
        value: string;
      };
    }
  | {
      type: typeof MULTI_SELECT;
      payload: {
        value: string[];
      };
    }
  | {
      type: typeof SINGLE_DATETIME;
      payload: {
        value: Date;
      };
    };

export type Condition = {
  target: Target;
  operator: T_DEFAULT_SEARCH_OPERATOR;
  input: SearchInput;
};

export type TConditionChangeAction =
  | {
      type: "add";
      payload: {
        condition: Condition;
      };
    }
  | {
      type: "remove";
      payload: {
        index: number;
      };
    }
  | {
      /** An edited condition, in place of the one at `index`. */
      type: "replace";
      payload: {
        index: number;
        condition: Condition;
      };
    }
  | {
      type: "clear";
    };

export type TConditionInputState = {
  targets: Target[];
  changeAction?: TConditionChangeAction;
} & (
  | {
      status: "waiting for input";
    }
  | {
      /** The panel is open for one column: adding, or editing a condition. */
      status: "editing";
      target: Target;
      /** The condition being changed, or null for a new one. */
      editingIndex: number | null;
      /** Its current value, to fill the panel. */
      initial?: Condition;
    }
);

export type TConditionInputAction =
  | { type: "inputTarget"; payload: { targetKey: string } }
  | { type: "editCondition"; payload: { index: number; condition: Condition } }
  | { type: "applyCondition"; payload: { condition: Condition } }
  | { type: "deleteCondition"; payload: { index: number } }
  | { type: "clearConditions" }
  | { type: "reset" }
  | { type: "updateTargets"; payload: { targets: Target[] } }
  | { type: "executedChangeAction" };

export type TConditionInputReducer = Reducer<
  TConditionInputState,
  TConditionInputAction
>;

export type TConditionInputStateContext = TConditionInputState;
export type TConditionInputActionContext = {
  /** Opens the panel to add a condition on this column. */
  inputTarget: (targetKey: string) => void;
  /** Opens the panel to change the condition at `index`. */
  editCondition: (index: number, condition: Condition) => void;
  /** Adds the condition, or puts it in place of the one being edited. */
  applyCondition: (condition: Condition) => void;
  deleteCondition: (index: number) => void;
  clearConditions: () => void;
  /** Closes the panel without a change. */
  reset: () => void;
  updateTargets: (targets: Target[]) => void;
};

export type TConditionInputHook = (
  targets: Target[],
  onChangeCondition: (action: TConditionChangeAction) => void
) => {
  state: TConditionInputState;
  actions: TConditionInputActionContext;
};
