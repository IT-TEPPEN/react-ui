"use client";

import { memo } from "react";
import { usePasteActionContext } from "../table/paste/provider";

export const RenderingCheck = memo(function RC() {
  const {} = usePasteActionContext();
  console.log("Render");
  return <></>;
});
