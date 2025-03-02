import { Reducer } from "react";

export interface Options {
  /**
   * The label is the string that will be displayed for the option.
   */
  label: string;

  /**
   * The value is the value of the option and will not be displayed.
   */
  value: string;

  /**
   * The searchLabel is the string that will be displayed in the list of options when the user is selecting an option.
   * The difference between label and searchLabel is that label is the string displayed when the option is selected,
   * while searchLabel is the string displayed in the list of options during selection.
   * If searchLabel is undefined, the list of options will display the label.
   */
  searchLabel?: string;

  /**
   * The searchText is the string used for searching and filtering the list of options.
   * For example, in the case of Japanese options, you can use hiragana or katakana readings in searchText,
   * allowing users to search using hiragana even if the displayed label is in kanji.
   * If searchText is undefined, the search will use searchLabel if defined, otherwise it will use label.
   */
  searchText?: string;
}

export type OptionsWindowState =
  | {
      isOpen: false;
    }
  | {
      isOpen: true;
      selectBoxId: string;
      options: Options[];
      searchText: string;
      selectingValue?: string;
      onSelect: (value: string) => void;
    };

export type OptionsWindowAction =
  | {
      type: "open";
      payload: {
        selectBoxId: string;
        options: Options[];
        onSelect: (value: string) => void;
        searchText?: string;
        defaultValue?: string;
      };
    }
  | {
      type: "setSearchText";
      payload: {
        searchText: string;
      };
    }
  | {
      type: "close";
    };

export type TOptionsWindowReducer = Reducer<
  OptionsWindowState,
  OptionsWindowAction
>;

export type TOptionsWindowStateContext = OptionsWindowState;
export type TOptionsWindowActionContext = {
  openOptionsWindow: (
    selectBoxId: string,
    options: Options[],
    onSelect: (value: string) => void,
    option?: { defaultValue?: string; searchText?: string }
  ) => void;
  setSearchText: (searchText: string) => void;
  closeOptionsWindow: () => void;
};

export type TOptionsWindowHook = () => {
  state: TOptionsWindowStateContext;
  actions: TOptionsWindowActionContext;
};
