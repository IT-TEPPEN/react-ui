export type TCopyStateContext = {
  /** When cells were last copied (shows the "copied" notice). */
  copiedAt?: Date;
};

export type TCopyActionContext = {
  copy: (options?: { enableDeprecatedCopy?: boolean }) => void;
};

export type TReturnCopyReducer = {
  states: TCopyStateContext;
  actions: TCopyActionContext;
};
