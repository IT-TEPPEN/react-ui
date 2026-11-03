import { useMemo, useReducer } from "react";
import { Options, TOptionsWindowHook } from "./type";
import { optionsWindowReducer } from "./reducer";

export const useOptionsWindowHook: TOptionsWindowHook = () => {
  const [state, dispatch] = useReducer(optionsWindowReducer, {
    isOpen: false,
  });

  const retrunState = useMemo(() => {
    if (!state.isOpen) {
      return state;
    } else {
      const query = state.searchText.trim().toLowerCase();
      const options = state.options.flatMap((option) => {
        if (option.fromSearchText) {
          const label = option.fromSearchText(state.searchText);
          return label === null ? [] : [{ ...option, label }];
        }
        return [option];
      });
      const shown = options.filter((option) => {
          if (option.fromSearchText) return true;
          if (option.searchText) {
            return option.searchText
              .toLowerCase()
              .includes(state.searchText.toLowerCase());
          } else if (option.searchLabel) {
            return option.searchLabel
              .toLowerCase()
              .includes(state.searchText.toLowerCase());
          } else {
            return option.label
              .toLowerCase()
              .includes(state.searchText.toLowerCase());
          }
        });
      // An option named exactly as typed comes first (e.g. a column name).
      const exact = shown.findIndex(
        (option) =>
          !option.fromSearchText && option.label.trim().toLowerCase() === query
      );
      if (query !== "" && exact > 0) {
        shown.unshift(...shown.splice(exact, 1));
      }
      return { ...state, options: shown };
    }
  }, [state]);

  const returnActions = useMemo(
    () => ({
      openOptionsWindow: (
        selectBoxId: string,
        options: Options[],
        onSelect: (value: string, searchText: string) => void,
        option?: { defaultValue?: string; searchText?: string }
      ) => {
        dispatch({
          type: "open",
          payload: {
            selectBoxId,
            options,
            onSelect,
            searchText: option?.searchText,
            defaultValue: option?.defaultValue,
          },
        });
      },
      setSearchText: (searchText: string) => {
        dispatch({
          type: "setSearchText",
          payload: {
            searchText,
          },
        });
      },
      closeOptionsWindow: () => {
        dispatch({
          type: "close",
        });
      },
    }),
    []
  );

  return {
    state: retrunState,
    actions: returnActions,
  };
};
