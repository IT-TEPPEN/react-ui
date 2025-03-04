import { TOptionsWindowReducer } from "./type";

export const optionsWindowReducer: TOptionsWindowReducer = (state, action) => {
  switch (action.type) {
    case "open":
      return {
        isOpen: true,
        selectBoxId: action.payload.selectBoxId,
        options: action.payload.options,
        searchText: action.payload.searchText || "",
        onSelect: action.payload.onSelect,
        selectingValue: action.payload.defaultValue,
      };
    case "setSearchText":
      if (!state.isOpen) return state;

      if (state.searchText === action.payload.searchText) return state;

      return {
        ...state,
        searchText: action.payload.searchText,
      };
    case "close":
      if (!state.isOpen) return state;

      return {
        isOpen: false,
      };
  }
};
