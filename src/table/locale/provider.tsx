import { createContext, useContext } from "react";
import { MESSAGES, TLocale, TMessages } from "./messages";

const LocaleContext = createContext<TLocale>("ja");

export function LocaleProvider(props: {
  locale?: TLocale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={props.locale ?? "ja"}>
      {props.children}
    </LocaleContext.Provider>
  );
}

/** Messages in the table's locale (Japanese by default). */
export function useMessages(): TMessages {
  return MESSAGES[useContext(LocaleContext)];
}
