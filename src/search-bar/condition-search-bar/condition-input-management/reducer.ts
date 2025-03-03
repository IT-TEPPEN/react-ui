import { DEFAULT_SEARCH_OPERATOR } from "../../../share/search-operator";
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
        targets: state.targets,
        onChangeCondition: state.onChangeCondition,
        status: "inputted target",
        inputtingCondition: {
          type: target.type,
          target,
        },
        useableOperators: DEFAULT_SEARCH_OPERATOR.filter(
          (o) => o.type === target.type
        ),
      };
    }

    case "inputOperator": {
      if (state.status !== "inputted target") {
        return state;
      }

      const operator = DEFAULT_SEARCH_OPERATOR.find(
        (o) => o.key === action.payload.operatorKey
      );

      if (!operator) {
        return state;
      }

      if (operator.type !== state.inputtingCondition.target.type) {
        return state;
      }

      return {
        targets: state.targets,
        onChangeCondition: state.onChangeCondition,
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

      state.onChangeCondition({
        type: "add",
        payload: {
          condition: {
            target: state.inputtingCondition.target,
            operator: state.inputtingCondition.operator,
            value: action.payload.value,
          },
        },
      });

      return {
        targets: state.targets,
        onChangeCondition: state.onChangeCondition,
        status: "waiting for input",
      };
    }

    case "deleteCondition": {
      state.onChangeCondition({
        type: "remove",
        payload: {
          index: action.payload.index,
        },
      });

      return state;
    }

    case "reset": {
      return {
        targets: state.targets,
        onChangeCondition: state.onChangeCondition,
        status: "waiting for input",
      };
    }

    case "updateTargets": {
      return {
        targets: action.payload.targets,
        onChangeCondition: state.onChangeCondition,
        status: "waiting for input",
      };
    }

    case "removeInputedTarget": {
      if (
        !(
          state.status == "inputted target" ||
          state.status == "inputted operator"
        )
      ) {
        return state;
      }

      return {
        targets: state.targets,
        onChangeCondition: state.onChangeCondition,
        status: "waiting for input",
      };
    }

    case "removeInputedOperator": {
      if (state.status !== "inputted operator") {
        return state;
      }

      return {
        targets: state.targets,
        onChangeCondition: state.onChangeCondition,
        status: "inputted target",
        inputtingCondition: {
          type: state.inputtingCondition.target.type,
          target: state.inputtingCondition.target,
        },
        useableOperators: DEFAULT_SEARCH_OPERATOR.filter(
          (o) => o.type === state.inputtingCondition.target.type
        ),
      };
    }
  }
};
