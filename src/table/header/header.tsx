"use client";

import { DataRecord, TTableColumn } from "../table/type";
import { useColumnsWidthState } from "./columns-width";

type TPropsTableHeader<T extends DataRecord> = {
  id: string;
  col: TTableColumn<T>;
};

export function TableHeaderElement<T extends DataRecord>(
  props: TPropsTableHeader<T>
) {
  const { getColumnWidth } = useColumnsWidthState();
  const colWidth = getColumnWidth(props.col.key as string);
  return (
    <th
      id={props.id}
      className="relative"
      style={{ width: colWidth, maxWidth: colWidth, minWidth: colWidth }}
    ></th>
  );
}
