import { TFilterReducer } from "./type";

export const filterReducer: TFilterReducer = (state, action) => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        conditions: [...state.conditions, action.payload.condition],
      };
    case "remove":
      return {
        ...state,
        conditions: state.conditions.filter(
          (_, index) => index !== action.payload.index
        ),
      };
    case "replace":
      return {
        ...state,
        conditions: state.conditions.map((condition, index) =>
          index === action.payload.index ? action.payload.condition : condition
        ),
      };
    case "clear":
      return {
        ...state,
        conditions: [],
      };
    case "setMode":
      if (state.mode === action.payload.mode) return state;
      return { ...state, mode: action.payload.mode };
  }
};
