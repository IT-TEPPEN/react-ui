import { memo } from "react";
import { DataRecord, TTableColumn } from "../table/type";
import { Checkbox } from "../checkbox/components";
import { TableCell } from "../cell/ui/cell";
import { IdGenerator } from "../libs";
import { useRangeActionContext } from "../range/provider";

interface TPropsRow<T extends DataRecord> {
  dataString: string;
  cols: TTableColumn<T>[];
  existCheckbox?: boolean;
  rowIndex: number;
  conditionalFormattingString: string;
  onClickRow?: (row: any) => void;
  applyRowFormatting?: (row: any) => string;
}

export const Row = memo(function R<T extends DataRecord>(props: TPropsRow<T>) {
  const { reset } = useRangeActionContext();
  const row = JSON.parse(props.dataString);
  const conditionalFormatting = props.conditionalFormattingString.split(",");

  return (
    <tr
      className={`relative border border-gray-200 after:absolute after:w-full after:h-full after:top-0 after:left-0 after:pointer-events-none after:hover:bg-gray-500/10 ${
        !!props.onClickRow ? "hover:cursor-pointer" : ""
      } ${props.applyRowFormatting ? props.applyRowFormatting(row) : ""}`}
      onClick={(e) => {
        e.preventDefault();

        if (!!props.onClickRow) {
          props.onClickRow(row);
          reset();
        }
      }}
      data-testid={row.id}
    >
      {props.existCheckbox && (
        <td
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Checkbox row={row} />
        </td>
      )}
      {props.cols.map((col, j) => {
        return (
          <TableCell
            key={col.key as string}
            id={IdGenerator.getTableCellId(props.rowIndex, j)}
            row={row}
            isExistOnClickRow={!!props.onClickRow}
            cellFormatClassName={conditionalFormatting[j]}
            editable={col.editable ?? false}
          />
        );
      })}
    </tr>
  );
});
