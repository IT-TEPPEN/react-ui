import { TConditionInputReducer } from "./type";

export const conditionInputReducer: TConditionInputReducer = (
  state,
  action
) => {
  switch (action.type) {
    case "inputTarget": {
      if (state.status !== "waiting for input") {
        return state;
      }

      const target = state.targets.find(
        (t) => t.key === action.payload.targetKey
      );

      if (!target) {
        return state;
      }

      return {
        conditions: state.conditions,
        targets: state.targets,
        operators: state.operators,
        status: "inputted target",
        inputtingCondition: {
          type: target.type,
          target,
        },
      };
    }

    case "inputOperator": {
      if (state.status !== "inputted target") {
        return state;
      }

      const operator = state.operators.find(
        (o) => o.key === action.payload.operatorKey
      );

      if (!operator) {
        return state;
      }

      if (operator.type !== state.inputtingCondition.target.type) {
        return state;
      }

      return {
        conditions: state.conditions,
        targets: state.targets,
        operators: state.operators,
        status: "inputted operator",
        inputtingCondition: {
          type: state.inputtingCondition.target.type,
          target: state.inputtingCondition.target,
          operator,
        },
      };
    }

    case "inputValue": {
      if (state.status !== "inputted operator") {
        return state;
      }

      return {
        conditions: [
          ...state.conditions,
          {
            target: state.inputtingCondition.target,
            operator: state.inputtingCondition.operator,
            value: action.payload.value,
          },
        ],
        targets: state.targets,
        operators: state.operators,
        status: "waiting for input",
      };
    }

    case "deleteCondition": {
      return {
        ...state,
        conditions: state.conditions.filter(
          (_, i) => i !== action.payload.index
        ),
      };
    }

    case "reset": {
      return {
        conditions: [],
        targets: state.targets,
        operators: state.operators,
        status: "waiting for input",
      };
    }

    case "updateTargets": {
      return {
        conditions: state.conditions,
        targets: action.payload.targets,
        operators: state.operators,
        status: "waiting for input",
      };
    }
  }
};
