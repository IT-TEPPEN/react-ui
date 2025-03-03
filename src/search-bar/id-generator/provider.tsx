"use client";

import { useMemo } from "react";
import { IdGeneratorContext } from "./context";
import { TComponentType } from "./type";

export function IdGeneratorProvider(props: {
  children: React.ReactNode;
  id: string;
}) {
  const actions = useMemo(
    () => ({
      generateId: (componentType: TComponentType) => {
        return `${props.id}:${componentType}`;
      },
    }),
    []
  );

  return (
    <IdGeneratorContext.Provider value={actions}>
      {props.children}
    </IdGeneratorContext.Provider>
  );
}
