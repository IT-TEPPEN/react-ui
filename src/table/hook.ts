import { useCallback, useEffect, useMemo } from "react";
import { DataObject, DataRecord, TPropsTable } from "./type";
import { usePageContext } from "./pagenation/providers";
import { useFilterContext } from "./filter";
import { useSortContext } from "./sort";
import { useFocusActionContext } from "./focus/provider";
import { useCheckboxStatusContext } from "./checkbox/provider";
import { useEditActionContext } from "./edit/provider";
import {
  useColumnsContext,
  useColumnValidatesContext,
  useProcessedDataContext,
} from "./sheet/providers";

export function useTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { filter } = useFilterContext();
  const { sort } = useSortContext();
  const { setRowCount, pageFilter } = usePageContext();
  const { dispatchCheckboxStatus } = useCheckboxStatusContext();

  const filteredRows = useMemo(() => filter(props.rows), [filter, props.rows]);

  useEffect(() => {
    setRowCount(filteredRows.length);
  }, [filteredRows.length]);

  const checkBoxes = useMemo(() => {
    if (!props.checkbox) {
      return [];
    }

    return props.rows.filter((row) => props.checkbox?.checked(row));
  }, [props.checkbox, props.rows]);

  useEffect(() => {
    dispatchCheckboxStatus({
      type: "SET",
      payload: { checkedRecords: checkBoxes },
    });
  }, [checkBoxes]);

  const sortedRows = useMemo(() => sort(filteredRows), [filteredRows, sort]);

  const pageRows = useMemo(
    () => pageFilter(sortedRows),
    [pageFilter, sortedRows]
  );

  return {
    cols: props.cols,
    rows: pageRows,
  };
}

export function useCell<T extends DataRecord>(
  rowIndex: number,
  colIndex: number,
  onUpdateRow?: (newRow: DataObject<T>, oldRow: DataObject<T>) => void
) {
  const focus = useFocusActionContext();
  const editAction = useEditActionContext();
  const rows = useProcessedDataContext().rows;
  const cols = useColumnsContext();
  const colValidator = useColumnValidatesContext();

  const focusAtCell = useCallback(() => {
    focus.move(rowIndex, colIndex);
    focus.focus(rowIndex, colIndex);
  }, [focus, rowIndex, colIndex]);

  const pasteData = useCallback(
    (text: string) => {
      let colLength = 0;

      const tableData = text
        .trim()
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((row) => {
          const colsData = row.split("\t");
          colLength = Math.max(colLength, colsData.length);
          return colsData;
        });

      if (tableData.length === 0 || colLength === 0) {
        return;
      }

      for (let i = 0; i < colLength; i++) {
        const col = cols[colIndex + i];

        if (!col.editable) {
          alert(
            `編集できない列にデータを貼り付けることはできません。\n\n編集不可列: ${
              col.label ?? col.key
            }`
          );
          return;
        }
      }

      if (tableData.length + rowIndex > rows.length) {
        alert("貼り付け先の行数が足りません。");
        return;
      }

      for (let i = 0; i < tableData.length; i++) {
        for (let j = 0; j < tableData[i].length; j++) {
          const col = cols[colIndex + j];
          const validate = colValidator[col.key];

          if (!validate(tableData[i][j])) {
            alert(
              `[${
                col.label ?? col.key
              }]列に次の不正なデータが含まれています。\n${tableData[i][j]}`
            );
            return;
          }
        }
      }

      for (let i = 0; i < tableData.length; i++) {
        let checkUpdatedRow = false;
        const row = { ...rows[rowIndex + i] };

        for (let j = 0; j < tableData[i].length; j++) {
          const col = cols[colIndex + j];
          const value =
            col.type === "number"
              ? Number(tableData[i][j])
              : col.type === "select"
              ? tableData[i][j] === ""
                ? ""
                : col.options.find(
                    (option) => option.label === tableData[i][j]
                  )!.value
              : tableData[i][j];

          if (row[col.key] !== value) {
            checkUpdatedRow = true;

            row[col.key] = value;
          }
        }
        if (checkUpdatedRow && onUpdateRow)
          onUpdateRow!(
            row as DataObject<T>,
            rows[rowIndex + i] as DataObject<T>
          );
      }
    },
    [rowIndex, colIndex]
  );

  const onDoubleClickCellToEdit: React.MouseEventHandler<HTMLDivElement> =
    useCallback(
      (e) => {
        e.preventDefault();
        focus.move(rowIndex, colIndex);
        focus.focus(rowIndex, colIndex);
        editAction.startEditing();
      },
      [focus, editAction]
    );

  const preventPropagation: React.MouseEventHandler<HTMLDivElement> =
    useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

  return {
    focusAtCell,
    onDoubleClickCellToEdit,
    preventPropagation,
    pasteData,
  };
}
