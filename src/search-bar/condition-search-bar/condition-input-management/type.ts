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
      operators: ISearchOperator[];
      onChangeCondition: (action: TConditionChangeAction) => void;
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
    }
  | {
      type: "removeInputedTarget";
    }
  | {
      type: "removeInputedOperator";
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
  removeInputedTarget: () => void;
  removeInputedOperator: () => void;
};

export type TConditionInputHook = (
  targets: Target[],
  onChangeCondition: (action: TConditionChangeAction) => void,
  options?: {
    operators?: ISearchOperator[];
  }
) => {
  state: TConditionInputState;
  actions: TConditionInputActionContext;
};
