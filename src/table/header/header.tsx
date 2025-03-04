"use client";

import { memo } from "react";
import { useColumnsWidthState } from "./columns-width";

type TPropsTableHeader = {
  keyname: string;
};

export const TableHeaderElement = memo(function THE(props: TPropsTableHeader) {
  const { getColumnWidth } = useColumnsWidthState();
  const colWidth = getColumnWidth(props.keyname);

  return (
    <th
      style={{ width: colWidth, maxWidth: colWidth, minWidth: colWidth }}
    ></th>
  );
});
