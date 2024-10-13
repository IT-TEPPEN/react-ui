import { DataObject, DataRecord } from "../../table/table/type";

export interface ITable {
  rows: DataObject<DataRecord>[];
  getCellData(rowIndex: number, colIndex: number): any;
  getCellId(rowIndex: number, colIndex: number): string;
  getColId(colIndex: number): string;
  getColLabel(colIndex: number): string;
  getColType(colIndex: number): "string" | "number" | "select" | "component";
  getColEditable(colIndex: number): boolean;
  getColInitialWidth(colIndex: number): number | undefined;
  getColMinWidth(colIndex: number): number | undefined;
  getCellComponent(rowIndex: number, colIndex: number): React.ReactNode;
  getCellDesign(rowIndex: number, colIndex: number): string;
  getRowDesign(rowIndex: number): string;
  getRowLength(): number;
  getColLength(): number;
  getIsExistOnClickRow(): boolean;
  getOnClickRow(rowIndex: number): () => void;
  focusCell(rowIndex: number, colIndex: number): void;
  unfocusCell(): void;
  switchToEditMode(position?: { rowIndex: number; colIndex: number }): void;
  setUpdateCellDataFunction(
    rowIndex: number,
    colIndex: number,
    func: () => void
  ): void;
  setUpdateCellFrameFunction(
    rowIndex: number,
    colIndex: number,
    func: () => void
  ): void;
  setUpdateRowFrameFunction(rowIndex: number, func: () => void): void;
  setUpdateColumnHeaderFunction(colIndex: number, func: () => void): void;
  initializeCellsDesign(): void;
  updateCellData(index: number, key: string, value: any): void;
  updateCellDesign(rowIndex: number, colIndex: number): void;
  refreshData(data: DataObject<DataRecord>[]): void;
}
