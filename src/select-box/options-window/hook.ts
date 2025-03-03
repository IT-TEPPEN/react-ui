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
      return {
        ...state,
        options: state.options.filter((option) => {
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
        }),
      };
    }
  }, [state]);

  const returnActions = useMemo(
    () => ({
      openOptionsWindow: (
        selectBoxId: string,
        options: Options[],
        onSelect: (value: string) => void,
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
