import { Reducer } from "react";

type Type = "string" | "number" | "date";

export interface Target {
  key: string;
  label: string;
  type: Type;
}

export interface Operator {
  key: string;
  label: string;
  type: Type;
}

export type Condition = {
  target: Target;
  operator: Operator;
  value: string;
};

export type TConditionInputState =
  | {
      conditions: Condition[];
      targets: Target[];
      operators: Operator[];
    } & (
      | {
          status: "waiting for input";
        }
      | {
          status: "inputted target";
          inputtingCondition: {
            type: Type;
            target: Target;
          };
        }
      | {
          status: "inputted operator";
          inputtingCondition: {
            type: Type;
            target: Target;
            operator: Operator;
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
      payload: { value: string };
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
    };

export type TConditionInputReducer = Reducer<
  TConditionInputState,
  TConditionInputAction
>;

export type TConditionInputStateContext = TConditionInputState;
export type TConditionInputActionContext = {
  inputTarget: (targetKey: string) => void;
  inputOperator: (operatorKey: string) => void;
  inputValue: (value: string) => void;
  deleteCondition: (index: number) => void;
  reset: () => void;
  updateTargets: (targets: Target[]) => void;
};

export type TConditionInputHook = (
  targets: Target[],
  options?: {
    operators?: Operator[];
  }
) => {
  state: TConditionInputState;
  actions: TConditionInputActionContext;
};
