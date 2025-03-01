import { conditionInputReducer } from "./reducer";
import { TConditionInputState, TConditionInputAction } from "./type";

describe("conditionInputReducer", () => {
  const initialState: TConditionInputState = {
    conditions: [],
    targets: [{ key: "target1", label: "対象1", type: "string" }],
    operators: [{ key: "eq", label: "=", type: "string" }],
    status: "waiting for input",
  };

  it.each([
    [
      "inputTarget",
      { type: "inputTarget", payload: { targetKey: "target1" } },
      {
        conditions: [],
        targets: [{ key: "target1", label: "対象1", type: "string" }],
        operators: [{ key: "eq", label: "=", type: "string" }],
        status: "inputted target",
        inputtingCondition: {
          type: "string",
          target: { key: "target1", label: "対象1", type: "string" },
        },
      },
    ],
    [
      "inputOperator",
      {
        type: "inputOperator",
        payload: { operatorKey: "eq" },
      },
      {
        conditions: [],
        targets: [{ key: "target1", label: "対象1", type: "string" }],
        operators: [{ key: "eq", label: "=", type: "string" }],
        status: "inputted operator",
        inputtingCondition: {
          type: "string",
          target: { key: "target1", label: "対象1", type: "string" },
          operator: { key: "eq", label: "=", type: "string" },
        },
      },
    ],
    [
      "inputValue",
      {
        type: "inputValue",
        payload: { value: "value1" },
      },
      {
        conditions: [
          {
            target: { key: "target1", label: "対象1", type: "string" },
            operator: { key: "eq", label: "=", type: "string" },
            value: "value1",
          },
        ],
        targets: [{ key: "target1", label: "対象1", type: "string" }],
        operators: [{ key: "eq", label: "=", type: "string" }],
        status: "waiting for input",
      },
    ],
  ])("should handle %s action", (actionType, action, expectedState) => {
    const state =
      actionType === "inputTarget"
        ? initialState
        : {
            ...initialState,
            status:
              actionType === "inputOperator"
                ? "inputted target"
                : "inputted operator",
            inputtingCondition: {
              type: "string",
              target: { key: "target1", label: "対象1", type: "string" },
              ...(actionType !== "inputTarget" && {
                operator: { key: "eq", label: "=", type: "string" },
              }),
            },
          };
    const newState = conditionInputReducer(
      state as any,
      action as TConditionInputAction
    );
    expect(newState).toMatchObject(expectedState);
  });

  it("should handle deleteCondition action", () => {
    const state: TConditionInputState = {
      ...initialState,
      conditions: [
        {
          target: { key: "target1", label: "対象1", type: "string" },
          operator: { key: "eq", label: "=", type: "string" },
          value: "value1",
        },
      ],
    };
    const action: TConditionInputAction = {
      type: "deleteCondition",
      payload: { index: 0 },
    };
    const newState = conditionInputReducer(state, action);
    expect(newState.conditions).toEqual([]);
  });

  it("should handle reset action", () => {
    const state: TConditionInputState = {
      ...initialState,
      conditions: [
        {
          target: { key: "target1", label: "対象1", type: "string" },
          operator: { key: "eq", label: "=", type: "string" },
          value: "value1",
        },
      ],
    };
    const action: TConditionInputAction = { type: "reset" };
    const newState = conditionInputReducer(state, action);
    expect(newState.conditions).toEqual([]);
    expect(newState.status).toBe("waiting for input");
  });

  it("should handle updateTargets action", () => {
    const action: TConditionInputAction = {
      type: "updateTargets",
      payload: {
        targets: [{ key: "target2", label: "対象2", type: "number" }],
      },
    };
    const newState = conditionInputReducer(initialState, action);
    expect(newState.targets).toEqual([
      { key: "target2", label: "対象2", type: "number" },
    ]);
  });
});
