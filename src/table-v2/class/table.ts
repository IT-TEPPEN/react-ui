import {
  DataObject,
  DataRecord,
  TConditionalFormatting,
  TPropsTable,
} from "../component/table/type";
import { ITable } from "../interface/table";

type TUpdateCellFunctions = {
  [rowIndex: number]: { [colIndex: number]: () => void };
};

export class CTable implements ITable {
  rows: DataObject<DataRecord>[];
  cols: TPropsTable<DataRecord>["cols"];
  colKeyMap: { [key: string]: number };
  cellsDesign: string[][];
  updateCellDataFunctions: TUpdateCellFunctions;
  updateCellFrameFunctions: TUpdateCellFunctions;
  updateRowFrameFunctions: { [colIndex: number]: () => void };
  updateColumnHeaderFunctions: { [colIndex: number]: () => void };
  updateEditorFunction: () => void = () => {};
  isEditing: boolean = false;
  onClickRow?: (row: DataObject<DataRecord>) => void;
  focusedCell: { rowIndex: number; colIndex: number } | null = null;
  applyRowFormatting?: (row: DataObject<DataRecord>) => string;
  conditionalFormattings?: TConditionalFormatting<DataRecord>[];

  constructor(property: TPropsTable<DataRecord>) {
    this.rows = property.rows;
    this.cols = property.cols;
    this.colKeyMap = this.cols.reduce((acc, col, index) => {
      acc[col.key] = index;
      return acc;
    }, {} as { [key: string]: number });
    this.updateCellDataFunctions = {};
    this.updateCellFrameFunctions = {};
    this.updateRowFrameFunctions = {};
    this.updateColumnHeaderFunctions = {};
    this.cellsDesign = this.initializeCellsDesign();
    this.onClickRow = property.onClickRow;
    this.applyRowFormatting = property.applyRowFormatting;
    this.conditionalFormattings = property.conditionalFormattings;
  }

  getCellId(rowIndex: number, colIndex: number) {
    return `table-cell-${rowIndex}-${colIndex}`;
  }

  getColId(colIndex: number): string {
    return `table-col-${colIndex}`;
  }

  getCellData(rowIndex: number, colIndex: number) {
    return this.rows[rowIndex][this.cols[colIndex].key];
  }

  getColType(colIndex: number): "string" | "number" | "select" | "component" {
    const col = this.cols[colIndex];

    if ("render" in col) {
      return "component";
    }

    return col.type;
  }

  getColEditable(colIndex: number): boolean {
    return !!this.cols[colIndex].editable;
  }

  getColLabel(colIndex: number): string {
    return this.cols[colIndex].label ?? "";
  }

  getColInitialWidth(colIndex: number): number | undefined {
    return this.cols[colIndex].initialWidth;
  }

  getColMinWidth(colIndex: number): number | undefined {
    return this.cols[colIndex].minWidth;
  }

  getCellComponent(rowIndex: number, colIndex: number) {
    const col = this.cols[colIndex];
    if (col.editable) {
      return this.getCellData(rowIndex, colIndex);
    }

    if (col.type === "number") {
      const render = col.render;

      if (!render) {
        return this.getCellData(rowIndex, colIndex);
      }

      return render(
        this.getCellData(rowIndex, colIndex) as number,
        this.rows[rowIndex]
      );
    } else {
      const render = col.render;

      if (!render) {
        return this.getCellData(rowIndex, colIndex);
      }

      return render(
        this.getCellData(rowIndex, colIndex) as string,
        this.rows[rowIndex]
      );
    }
  }

  getOnCellBlur(rowIndex: number, colIndex: number): (value: string) => void {
    return (value: string) => {
      const col = this.cols[colIndex];

      if (!col.editable) {
        this.switchToFocusMode();
        return;
      }

      if (col.type === "number") {
        const numberValue = Number(value);
        col.onCellBlur(col.key, numberValue, this.rows[rowIndex], () =>
          this.switchToFocusMode()
        );
      } else {
        col.onCellBlur(col.key, value, this.rows[rowIndex], () =>
          this.switchToFocusMode()
        );
      }
    };
  }

  getRowLength() {
    return this.rows.length;
  }

  getColLength() {
    return this.cols.length;
  }

  getCellDesign(rowIndex: number, colIndex: number): string {
    if (!this.focusedCell) {
      return this.cellsDesign[rowIndex][colIndex];
    }

    const isFocused =
      this.focusedCell.rowIndex === rowIndex &&
      this.focusedCell.colIndex === colIndex;

    const focusDesign = isFocused
      ? "outline outline-1 -outline-offset-1 outline-[#9ca3af]"
      : "";

    return `${this.cellsDesign[rowIndex][colIndex]} ${focusDesign}`;
  }

  getRowDesign(rowIndex: number): string {
    const rowFormat = this.applyRowFormatting
      ? this.applyRowFormatting(this.rows[rowIndex])
      : "";

    const hoverFormat = this.getIsExistOnClickRow()
      ? "hover:cursor-pointer"
      : "";

    return `${rowFormat} ${hoverFormat}`;
  }

  getIsExistOnClickRow(): boolean {
    return !!this.onClickRow;
  }

  getOnClickRow(rowIndex: number): () => void {
    return () => {
      if (this.getIsExistOnClickRow()) {
        this.onClickRow!(this.rows[rowIndex]);
      }
    };
  }

  getFocusedCellId(): string | null {
    if (!this.focusedCell) {
      return null;
    }

    return this.getCellId(this.focusedCell.rowIndex, this.focusedCell.colIndex);
  }

  getFocusedCellIndex(): { rowIndex: number; colIndex: number } {
    if (!this.focusedCell) {
      return { rowIndex: -1, colIndex: -1 };
    }

    return this.focusedCell;
  }

  getFocusedCellValue(): string | number {
    if (!this.focusedCell) {
      return "";
    }

    return this.getCellData(
      this.focusedCell.rowIndex,
      this.focusedCell.colIndex
    );
  }

  getEditStatus(): {
    type: "string" | "number" | "select";
    isEditing: boolean;
    focusedCell: { rowIndex: number; colIndex: number } | null;
  } {
    return {
      type: !!this.focusedCell
        ? this.cols[this.focusedCell.colIndex].type
        : "string",
      isEditing: this.isEditing && !!this.focusedCell,
      focusedCell: this.focusedCell,
    };
  }

  focusCell(rowIndex: number, colIndex: number): void {
    const prev = this.focusedCell && { ...this.focusedCell };
    this.focusedCell = { rowIndex, colIndex };

    if (prev) {
      this.updateCellDesign(prev.rowIndex, prev.colIndex);
      this.updateEditorFunction();
    }

    this.updateCellDesign(rowIndex, colIndex);
  }

  unfocusCell(): void {
    const prev = this.focusedCell && { ...this.focusedCell };
    this.focusedCell = null;

    if (prev) {
      this.updateCellDesign(prev.rowIndex, prev.colIndex);
    }
  }

  switchToEditMode(position?: { rowIndex: number; colIndex: number }): void {
    if (this.isEditing) {
      return;
    }

    if (position) {
      this.focusedCell = position;
    }

    if (!this.cols[this.focusedCell!.colIndex].editable) {
      return;
    }

    this.isEditing = true;
    this.updateEditorFunction();
  }

  switchToFocusMode(): void {
    if (!this.isEditing) {
      return;
    }

    this.isEditing = false;
    this.updateEditorFunction();
  }

  setUpdateCellDataFunction(
    rowIndex: number,
    colIndex: number,
    func: () => void
  ) {
    if (!(rowIndex in this.updateCellDataFunctions)) {
      this.updateCellDataFunctions[rowIndex] = {};
    }
    this.updateCellDataFunctions[rowIndex][colIndex] = func;
  }

  setUpdateCellFrameFunction(
    rowIndex: number,
    colIndex: number,
    func: () => void
  ): void {
    if (!(rowIndex in this.updateCellFrameFunctions)) {
      this.updateCellFrameFunctions[rowIndex] = {};
    }
    this.updateCellFrameFunctions[rowIndex][colIndex] = func;
  }

  setUpdateRowFrameFunction(index: number, func: () => void): void {
    this.updateRowFrameFunctions[index] = func;
  }

  setUpdateColumnHeaderFunction(colIndex: number, func: () => void): void {
    this.updateColumnHeaderFunctions[colIndex] = func;
  }

  setUpdateEditorFunction(func: () => void): void {
    this.updateEditorFunction = func;
  }

  initializeCellsDesign(): string[][] {
    const cellsDesign = [...Array(this.getRowLength())].map(() =>
      Array(this.getColLength()).fill("")
    );

    return cellsDesign;
  }

  updateCellData(index: number, key: string, value: any) {
    this.rows[index][key] = value;

    if (key in this.colKeyMap) {
      this.updateCellDataFunctions[index][this.colKeyMap[key]]();
    }
  }

  updateCellDesign(rowIndex: number, colIndex: number): void {
    this.updateCellFrameFunctions[rowIndex][colIndex]();
  }

  refreshData(data: DataObject<DataRecord>[]) {
    const diff: { index: number; key: string; value: any }[] = [];
    for (let i = 0; i < data.length; i++) {
      for (const key in data[i]) {
        if (data[i][key] !== this.rows[i][key]) {
          diff.push({ index: i, key, value: data[i][key] });
        }
      }
    }
    diff.forEach((d) => {
      this.updateCellData(d.index, d.key, d.value);
    });
  }
}
