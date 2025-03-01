"use client";

import { useTable } from "./hook";
import { TableHeaderElement } from "../header/header";
import {
  DataRecord,
  TConditionalFormatting,
  TPropsTable,
  TTableColumn,
} from "./type";
import { PagenationProvider, DisplayRange, Pagenation } from "../pagenation";
import {
  FilterProvider,
  TableFilterForm,
  TableFilterRemoveButton,
} from "../filter";
import { SortProvider } from "../sort";
import { ColumnsProvider } from "../sheet/providers";
import { CheckboxProvider, CheckboxStatusProvider } from "../checkbox/provider";
import { EditProvider } from "../edit/provider";
import { TablePropertyProvider } from "../table-property/provider";
import { KeyboardSetting } from "../operation/components/keyboard-setting";
import { Row } from "../sheet/components";
import { PasteProvider } from "../paste/provider";
import { generateFormattingString } from "../libs/conditional-formatting";
import { Editor } from "../edit/ui/editor";
import { useFilteringColumnStateContext } from "../filter/hooks/selectedFilteringColumn/provider";
import {
  RangeProvider,
  TestRange,
  useRangeActionContext,
} from "../range/provider";
import { CopyProvider } from "../copy/provider";
import { CopiedMessage } from "../copy/components";
import { TableIdGeneratorProvider, useTableIdGenerator } from "../id";
import { TableHeader } from "../header/header-v2";
import { ColumnsWidthProvider, ScrollXPositionProvider } from "../header";
import { Frame } from "../frame";

export default function Table<T extends DataRecord>(props: TPropsTable<T>) {
  return (
    <TableIdGeneratorProvider id={props.id}>
      <ColumnsWidthProvider
        initialState={props.cols as TTableColumn<DataRecord>[]}
      >
        <FilterProvider>
          <SortProvider initialCondition={props.initialCondition?.sort}>
            <PagenationProvider
              rowCount={props.rows.length}
              perPage={props.initialCondition?.pagenation?.rowCountPerPage}
            >
              <CheckboxProvider checkbox={props.checkbox}>
                <CheckboxStatusProvider checkboxCount={props.rows.length}>
                  <ColumnsProvider
                    cols={props.cols}
                    errorHandler={props.errorHandler}
                  >
                    <EditProvider>
                      <TablePropertyProvider>
                        <RangeProvider>
                          <CopyProvider rows={props.rows} cols={props.cols}>
                            <CopiedMessage />
                            <PasteProvider
                              rows={props.rows}
                              cols={props.cols}
                              onUpdateRowFunction={props.onUpdateRow}
                            >
                              <KeyboardSetting
                                enableDeprecatedCopy={
                                  props.deprecatedOptions?.enableDeprecatedCopy
                                }
                              />
                              <ScrollXPositionProvider>
                                <BaseTable {...props} />
                              </ScrollXPositionProvider>
                            </PasteProvider>
                          </CopyProvider>
                        </RangeProvider>
                      </TablePropertyProvider>
                    </EditProvider>
                  </ColumnsProvider>
                </CheckboxStatusProvider>
              </CheckboxProvider>
            </PagenationProvider>
          </SortProvider>
        </FilterProvider>
      </ColumnsWidthProvider>
    </TableIdGeneratorProvider>
  );
}

function BaseTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { cols, rowMaps, pageRowIds } = useTable<T>(props);
  const filteringColumn = useFilteringColumnStateContext();
  const { reset } = useRangeActionContext();
  const IdGenerator = useTableIdGenerator();

  return (
    <div className="w-full">
      <div className="flex justify-end mb-1 mr-3">
        <TableFilterRemoveButton>
          <p className="text-xs underline text-gray-500 hover:text-gray-700">
            全てのフィルタリング条件を解除する
          </p>
        </TableFilterRemoveButton>
      </div>

      <div>
        <TableHeader
          cols={cols}
          checkbox={!!props.checkbox}
          rows={props.rows}
        />

        <div
          id={IdGenerator.getTableId()}
          className="relative h-full max-w-full max-h-[80vh] border border-gray-200 bg-white rounded-b-md overflow-auto no_scrollbar"
        >
          <Frame displayScroll={true}>
            <table className={`table`}>
              <thead>
                <tr>
                  {props.checkbox && <th></th>}
                  {cols.map((col) => (
                    <TableHeaderElement
                      key={col.key.toString()}
                      keyname={col.key.toString()}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {!!filteringColumn && (
                  <tr
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                  >
                    <td
                      colSpan={cols.length}
                      className="sticky top-8 left-0 bg-gray-300 w-full shadow-lg rounded-b-2xl z-20 p-0 overflow-hidden"
                    >
                      <TableFilterForm />
                    </td>
                  </tr>
                )}
                {pageRowIds.length === 0 && (
                  <tr>
                    <td colSpan={cols.length} className="py-5">
                      <p className="text-center font-bold text-lg">NO DATA</p>
                    </td>
                  </tr>
                )}
                {pageRowIds.map((rowId, i) => (
                  <Row
                    key={rowId}
                    existCheckbox={!!props.checkbox}
                    rowIndex={i}
                    dataString={rowMaps[rowId].stringValue}
                    cols={props.cols as TTableColumn<DataRecord>[]}
                    onClickRow={props.onClickRow}
                    applyRowFormatting={props.applyRowFormatting}
                    conditionalFormattingString={generateFormattingString(
                      rowMaps[rowId].data,
                      cols as TTableColumn<DataRecord>[],
                      props.conditionalFormattings as TConditionalFormatting<DataRecord>[]
                    )}
                  />
                ))}
              </tbody>
            </table>
          </Frame>
          <TestRange />
          <Editor rowMaps={rowMaps} pageRowIds={pageRowIds} />
        </div>
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
