"use client";

import { useTable } from "./hook";
import { TableCell } from "./cell/ui/cell";
import { TableHeaderElement } from "./header/header";
import { DataRecord, TPropsTable } from "./type";
import { PagenationProvider, DisplayRange, Pagenation } from "./pagenation";
import {
  FilterProvider,
  TableFilterForm,
  TableFilterRemoveButton,
  useFilterContext,
} from "./filter";
import { SortProvider } from "./sort";
import {
  ColumnsProvider,
  ProcessedDataProvider,
  RowProvider,
} from "./sheet/providers";
import { FocusProvider, useFocusActionContext } from "./focus/provider";
import { CheckboxProvider, CheckboxStatusProvider } from "./checkbox/provider";
import { AllCheckbox, Checkbox } from "./checkbox/components";
import { IdGenerator } from "./libs";
import { EditProvider } from "./edit/provider";
import { TablePropertyProvider } from "./table-property/provider";
import { AutoUpdateTableProperty } from "./table-property/components/auto-update-table-property";
import { KeyboardSetting } from "./operation/components/keyboard-setting";
import { AutoSwitchEditMode } from "./table/components/auto-switch-edit-mode";

export default function Table<T extends DataRecord>(props: TPropsTable<T>) {
  return (
    <FilterProvider>
      <SortProvider initialCondition={props.initialCondition?.sort}>
        <PagenationProvider
          rowCount={props.rows.length}
          perPage={props.initialCondition?.pagenation?.rowCountPerPage}
        >
          <CheckboxProvider checkbox={props.checkbox}>
            <CheckboxStatusProvider checkboxCount={props.rows.length}>
              <ProcessedDataProvider props={props}>
                <ColumnsProvider cols={props.cols}>
                  <FocusProvider>
                    <EditProvider>
                      <TablePropertyProvider>
                        <AutoUpdateTableProperty />
                        <AutoSwitchEditMode />
                        <KeyboardSetting />
                        <BaseTable {...props} />
                      </TablePropertyProvider>
                    </EditProvider>
                  </FocusProvider>
                </ColumnsProvider>
              </ProcessedDataProvider>
            </CheckboxStatusProvider>
          </CheckboxProvider>
        </PagenationProvider>
      </SortProvider>
    </FilterProvider>
  );
}

function BaseTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { cols, rows } = useTable<T>(props);
  const { selectedFilterKey } = useFilterContext();
  const { unfocus } = useFocusActionContext();

  return (
    <div className="w-full">
      <div className="flex justify-end mb-1 mr-3">
        <TableFilterRemoveButton>
          <p className="text-xs underline text-gray-500 hover:text-gray-700">
            全てのフィルタリング条件を解除する
          </p>
        </TableFilterRemoveButton>
      </div>

      <div
        id="table-frame"
        className="relative h-full max-w-full max-h-[80vh] border border-gray-200 rounded-md overflow-auto"
      >
        <table className={`table`}>
          <thead>
            <tr className="sticky top-0 border-gray-200 z-20 bg-gray-200 text-gray-600 h-[32px]">
              {props.checkbox && (
                <th>
                  <AllCheckbox rows={props.rows} />
                </th>
              )}
              {cols.map((col, i) => (
                <TableHeaderElement
                  id={IdGenerator.getTableColId(i)}
                  key={col.key as string}
                  columnKey={col.key as string}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {!!selectedFilterKey && (
              <tr>
                <td
                  colSpan={cols.length}
                  className="sticky top-8 left-0 bg-gray-300 w-full shadow-lg rounded-b-2xl z-20 p-0 overflow-hidden"
                >
                  <TableFilterForm />
                </td>
              </tr>
            )}
            {rows.length === 0 && (
              <tr>
                <td colSpan={cols.length} className="py-5">
                  <p className="text-center font-bold text-lg">NO DATA</p>
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <RowProvider key={r.id} row={r}>
                <tr
                  className={`relative border border-gray-200 after:absolute after:w-full after:h-full after:top-0 after:left-0 after:pointer-events-none after:hover:bg-gray-500/10 ${
                    !!props.onClickRow ? "hover:cursor-pointer" : ""
                  } ${
                    props.applyRowFormatting ? props.applyRowFormatting(r) : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();

                    if (!!props.onClickRow) {
                      props.onClickRow(r);
                      unfocus();
                    }
                  }}
                  data-testid={r.id}
                >
                  {props.checkbox && (
                    <td>
                      <Checkbox />
                    </td>
                  )}
                  {cols.map((col, j) => {
                    return (
                      <TableCell
                        key={col.key as string}
                        rowIndex={i}
                        colIndex={j}
                        columnKey={col.key as string}
                        isExistOnClickRow={!!props.onClickRow}
                        onUpdateRow={props.onUpdateRow}
                      />
                    );
                  })}
                </tr>
              </RowProvider>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-1">
        <DisplayRange />
        <div className="mt-2">
          <Pagenation />
        </div>
      </div>
    </div>
  );
}
