"use client";

import { createContext, useContext } from "react";
import { OptionsArea } from "./options-window";
import { SelectOptionsWindowProvider } from "./options-window/provider";

interface ISelectBoxProvider {
  children: React.ReactNode;
}

const IsDefinedContext = createContext(false);

export const SelectBoxProvider = (props: ISelectBoxProvider) => {
  const isDefined = useOnceRead();

  if (isDefined) {
    return <>{props.children}</>;
  }

  return (
    <IsDefinedContext.Provider value={true}>
      <SelectOptionsWindowProvider>
        {props.children}
        <OptionsArea />
      </SelectOptionsWindowProvider>
    </IsDefinedContext.Provider>
  );
};

const useOnceRead = () => {
  return useContext(IsDefinedContext);
};
