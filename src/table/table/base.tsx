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
import { FilterProvider } from "../filter-v2";
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
import { RangeProvider, TestRange } from "../range/provider";
import { CopyProvider } from "../copy/provider";
import { CopiedMessage } from "../copy/components";
import { TableIdGeneratorProvider, useTableIdGenerator } from "../id";
import { TableHeader } from "../header/header-v2";
import { ColumnsWidthProvider, ScrollXPositionProvider } from "../header";
import { Frame } from "../frame";
import { ComponentProvider } from "./component-provider";
import { useGenerateSortButton } from "./component-provider/provider";
import { SelectBoxProvider } from "../../select-box/provider";

export default function Table<T extends DataRecord>(props: TPropsTable<T>) {
  return (
    <ComponentProvider>
      <TableIdGeneratorProvider id={props.id}>
        <ColumnsWidthProvider
          initialState={props.cols as TTableColumn<DataRecord>[]}
        >
          <FilterProvider initialConditions={[]}>
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
                                    props.deprecatedOptions
                                      ?.enableDeprecatedCopy
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
    </ComponentProvider>
  );
}

function BaseTable<T extends DataRecord>(props: TPropsTable<T>) {
  const { cols, rowMaps, pageRowIds } = useTable<T>(props);
  const IdGenerator = useTableIdGenerator();
  const generateSortButton = useGenerateSortButton();

  return (
    <div className="w-full max-w-full">
      <div>
        <TableHeader
          cols={cols}
          checkbox={!!props.checkbox}
          rows={props.rows}
          maxWidth={props.maxWidth}
          generateSortButton={generateSortButton}
        />

        <SelectBoxProvider>
          <Frame
            id={IdGenerator.getTableId()}
            maxHeight={props.maxHeight}
            maxWidth={props.maxWidth}
            displayScroll={false}
          >
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
            <TestRange />
            <Editor rowMaps={rowMaps} pageRowIds={pageRowIds} />
          </Frame>
        </SelectBoxProvider>
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
