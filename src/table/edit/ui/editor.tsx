import { useEffect } from "react";
import { useColumnsContext } from "../../sheet/providers";
import { useEditActionContext, useEditStateContext } from "../provider";
import { NumberCellInput } from "./number-input";
import { SelectCellInput } from "./select-input";
import { StringCellInput } from "./string-input";
import { DataObject, DataRecord } from "../../table/type";
import { useRangeStateContext } from "../../range/provider";
import { useTableIdGenerator } from "../../id";

type TPropsEditor = {
  pageRowIds: (string | number)[];
  rowMaps: {
    [id: string]: {
      data: DataObject<DataRecord>;
      stringValue: string;
    };
    [id: number]: {
      data: DataObject<DataRecord>;
      stringValue: string;
    };
  };
};

export function Editor(props: TPropsEditor) {
  const IdGenerator = useTableIdGenerator();
  const range = useRangeStateContext();
  const edit = useEditStateContext();
  const editActions = useEditActionContext();
  const cols = useColumnsContext();

  useEffect(() => {
    if (range.isSelecting && !cols[range.start.colIndex].editable) {
      editActions.endEditing();
    }
  }, [edit, range]);

  if (!edit.isEditing) return <></>;
  if (!range.isSelecting) return <></>;

  const col = cols[range.start.colIndex];
  const row = props.rowMaps[props.pageRowIds[range.start.rowIndex]].data;

  if (!col.editable) return <></>;

  const id = IdGenerator.getTableCellId({
    rowIndex: range.start.rowIndex,
    columnIndex: range.start.colIndex,
  });
  const cellElement = document.getElementById(id);
  const rect = cellElement?.getBoundingClientRect();

  const size = rect
    ? {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      }
    : undefined;

  if (!size) return <></>;

  const tableElement = document.getElementById(IdGenerator.getTableId());
  if (!tableElement) return <></>;
  const rectTable = tableElement.getBoundingClientRect();

  size.top -= rectTable.top - tableElement.scrollTop;
  size.left -= rectTable.left - tableElement.scrollLeft;

  return (
    <div
      className="absolute top-0 left-0 grid place-items-center z-10 pr-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={{
        width: size.width,
        height: size.height,
        top: size.top - 1,
        left: size.left,
      }}
    >
      {col.type === "string" && <StringCellInput col={col} row={row} />}
      {col.type === "number" && <NumberCellInput col={col} row={row} />}
      {col.type === "select" && <SelectCellInput col={col} row={row} />}
    </div>
  );
}
