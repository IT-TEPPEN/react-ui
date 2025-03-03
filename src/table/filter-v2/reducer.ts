import { TFilterReducer } from "./type";

export const filterReducer: TFilterReducer = (state, action) => {
  switch (action.type) {
    case "add":
      return {
        conditions: [...state.conditions, action.payload.condition],
      };
    case "remove":
      return {
        conditions: state.conditions.filter(
          (_, index) => index !== action.payload.index
        ),
      };
    case "clear":
      return {
        conditions: [],
      };
  }
};
