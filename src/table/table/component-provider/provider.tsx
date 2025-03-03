"use client";

import { createContext, useCallback, useContext } from "react";
import { SortButton } from "../../sort";

const GenerateSortButtonContext = createContext<
  (columnKey: string) => JSX.Element
>(() => <></>);

export function ComponentProvider(props: { children: React.ReactNode }) {
  const generateSortButton = useCallback((columnKey: string) => {
    return <SortButton columnKey={columnKey} />;
  }, []);

  return (
    <GenerateSortButtonContext.Provider value={generateSortButton}>
      {props.children}
    </GenerateSortButtonContext.Provider>
  );
}

export function useGenerateSortButton() {
  return useContext(GenerateSortButtonContext);
}
