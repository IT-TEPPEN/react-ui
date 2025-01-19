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
