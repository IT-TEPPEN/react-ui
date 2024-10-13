import {
  DataObject,
  DataRecord,
  TConditionalFormatting,
  TPropsTable,
} from "../component/table/type";
import { ITable } from "../interface/table";

export class CTable implements ITable {
  rows: DataObject<DataRecord>[];
  cols: TPropsTable<DataRecord>["cols"];
  cellsDesign: string[][];
  updateCellDataFunctions: { [key: string]: () => void }[];
  updateCellFrameFunctions: { [key: string]: () => void }[];
  updateRowFrameFunctions: (() => void)[];
  updateColumnHeaderFunctions: (() => void)[];
  isEditing: boolean = false;
  onClickRow?: (row: DataObject<DataRecord>) => void;
  focusedCell: { rowIndex: number; colIndex: number } | null = null;
  applyRowFormatting?: (row: DataObject<DataRecord>) => string;
  conditionalFormattings?: TConditionalFormatting<DataRecord>[];

  constructor(property: TPropsTable<DataRecord>) {
    this.rows = property.rows;
    this.cols = property.cols;
    this.updateCellDataFunctions = Array(this.rows.length).fill({});
    this.updateCellFrameFunctions = Array(this.rows.length).fill({});
    this.updateRowFrameFunctions = [];
    this.updateColumnHeaderFunctions = [];
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

  getRowLength() {
    return this.rows.length;
  }

  getColLength() {
    return this.cols.length;
  }

  getCellDesign(rowIndex: number, colIndex: number): string {
    return this.cellsDesign[rowIndex][colIndex];
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
      if (this.onClickRow) {
        this.onClickRow(this.rows[rowIndex]);
      }
    };
  }

  focusCell(rowIndex: number, colIndex: number): void {
    this.focusedCell = { rowIndex, colIndex };
  }

  unfocusCell(): void {
    this.focusedCell = null;
  }

  switchToEditMode(position?: { rowIndex: number; colIndex: number }): void {
    if (this.isEditing) {
      return;
    }

    if (position) {
      this.focusedCell = position;
    }

    this.isEditing = true;
  }

  setUpdateCellDataFunction(
    rowIndex: number,
    colIndex: number,
    func: () => void
  ) {
    this.updateCellDataFunctions[rowIndex][this.cols[colIndex].key] = func;
  }

  setUpdateCellFrameFunction(
    rowIndex: number,
    colIndex: number,
    func: () => void
  ): void {
    this.updateCellFrameFunctions[rowIndex][this.cols[colIndex].key] = func;
  }

  setUpdateRowFrameFunction(index: number, func: () => void): void {
    this.updateRowFrameFunctions[index] = func;
  }

  setUpdateColumnHeaderFunction(colIndex: number, func: () => void): void {
    this.updateColumnHeaderFunctions[colIndex] = func;
  }

  initializeCellsDesign(): string[][] {
    const cellsDesign = [...Array(this.getRowLength())].map(() =>
      Array(this.getColLength()).fill("")
    );

    return cellsDesign;
  }

  updateCellData(index: number, key: string, value: any) {
    this.rows[index][key] = value;
    this.updateCellDataFunctions[index][key]();
  }

  updateCellDesign(rowIndex: number, colIndex: number): void {}

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
