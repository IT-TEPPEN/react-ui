"use client";

import { DataRecord } from "../table/type";
import { useColumnsWidthState } from "./columns-width";

type TPropsTableHeader = {
  keyname: string;
};

export function TableHeaderElement<T extends DataRecord>(
  props: TPropsTableHeader
) {
  const { getColumnWidth } = useColumnsWidthState();
  const colWidth = getColumnWidth(props.keyname);

  return (
    <th
      style={{ width: colWidth, maxWidth: colWidth, minWidth: colWidth }}
    ></th>
  );
}
