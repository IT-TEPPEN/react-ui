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
      type: "string" | "number" | "datetime";
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
        value: string;
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
    };

export type TConditionInputState =
  | {
      targets: Target[];
      changeAction?: TConditionChangeAction;
    } & (
      | {
          status: "waiting for input";
        }
      | {
          status: "inputted target";
          inputtingCondition: {
            type: "string" | "number" | "datetime" | "select";
            target: Target;
          };
          useableOperators: T_DEFAULT_SEARCH_OPERATOR[];
        }
      | {
          status: "inputted operator";
          inputtingCondition: {
            type: "string" | "number" | "datetime" | "select";
            target: Target;
            operator: T_DEFAULT_SEARCH_OPERATOR;
          };
        }
    );

export type TConditionInputAction =
  | {
      type: "inputTarget";
      payload: {
        targetKey: string;
      };
    }
  | {
      type: "inputOperator";
      payload: {
        operatorKey: string;
      };
    }
  | {
      type: "inputValue";
      payload: SearchInput;
    }
  | {
      type: "deleteCondition";
      payload: { index: number };
    }
  | {
      type: "reset";
    }
  | {
      type: "updateTargets";
      payload: { targets: Target[] };
    }
  | {
      type: "removeInputedTarget";
    }
  | {
      type: "removeInputedOperator";
    }
  | {
      type: "executedChangeAction";
    };

export type TConditionInputReducer = Reducer<
  TConditionInputState,
  TConditionInputAction
>;

export type TConditionInputStateContext = TConditionInputState;
export type TConditionInputActionContext = {
  inputTarget: (targetKey: string) => void;
  inputOperator: (operatorKey: string) => void;
  inputValue: (value: SearchInput) => void;
  deleteCondition: (index: number) => void;
  reset: () => void;
  updateTargets: (targets: Target[]) => void;
  removeInputedTarget: () => void;
  removeInputedOperator: () => void;
};

export type TConditionInputHook = (
  targets: Target[],
  onChangeCondition: (action: TConditionChangeAction) => void,
  options?: {
    operators?: T_DEFAULT_SEARCH_OPERATOR[];
  }
) => {
  state: TConditionInputState;
  actions: TConditionInputActionContext;
};
