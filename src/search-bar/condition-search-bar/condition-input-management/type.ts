import { Reducer } from "react";
import { ISearchOperator, TValueType } from "../../../share/search-operator";

export interface Target {
  key: string;
  label: string;
  type: TValueType;
}

export type Condition = {
  target: Target;
  operator: ISearchOperator;
  value: string;
};

export type TConditionInputState =
  | {
      conditions: Condition[];
      targets: Target[];
      operators: ISearchOperator[];
    } & (
      | {
          status: "waiting for input";
        }
      | {
          status: "inputted target";
          inputtingCondition: {
            type: TValueType;
            target: Target;
          };
          useableOperators: ISearchOperator[];
        }
      | {
          status: "inputted operator";
          inputtingCondition: {
            type: TValueType;
            target: Target;
            operator: ISearchOperator;
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
    operators?: ISearchOperator[];
  }
) => {
  state: TConditionInputState;
  actions: TConditionInputActionContext;
};
