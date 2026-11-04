import { TConditionInputReducer } from "./type";

export const conditionInputReducer: TConditionInputReducer = (
  state,
  action
) => {
  switch (action.type) {
    case "inputTarget": {
      const target = state.targets.find(
        (t) => t.key === action.payload.targetKey
      );
      if (!target) return state;

      return {
        targets: state.targets,
        status: "editing",
        target,
        editingIndex: null,
      };
    }

    case "editCondition": {
      const { index, condition } = action.payload;
      // The column as the search bar knows it now (e.g. its options).
      const target =
        state.targets.find((t) => t.key === condition.target.key) ??
        condition.target;

      return {
        targets: state.targets,
        status: "editing",
        target,
        editingIndex: index,
        initial: condition,
      };
    }

    case "applyCondition": {
      const { condition } = action.payload;
      const editingIndex =
        state.status === "editing" ? state.editingIndex : null;

      return {
        targets: state.targets,
        status: "waiting for input",
        changeAction:
          editingIndex === null
            ? { type: "add", payload: { condition } }
            : { type: "replace", payload: { index: editingIndex, condition } },
      };
    }

    case "deleteCondition": {
      return {
        targets: state.targets,
        status: "waiting for input",
        changeAction: {
          type: "remove",
          payload: { index: action.payload.index },
        },
      };
    }

    case "clearConditions": {
      return {
        targets: state.targets,
        status: "waiting for input",
        changeAction: { type: "clear" },
      };
    }

    case "reset": {
      if (state.status === "waiting for input") return state;
      return { targets: state.targets, status: "waiting for input" };
    }

    case "updateTargets": {
      const targets = action.payload.targets;

      if (state.status === "waiting for input") {
        return { ...state, targets };
      }

      // Keep the panel open when its column still exists (e.g. when the
      // options of a select column arrive later).
      const target = targets.find((t) => t.key === state.target.key);
      if (!target || target.type !== state.target.type) {
        return { targets, status: "waiting for input" };
      }
      return { ...state, targets, target };
    }

    case "executedChangeAction": {
      return { ...state, changeAction: undefined };
    }
  }
};
