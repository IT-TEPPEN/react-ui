import { DataObject, DataRecord, TPropsTable } from "../component/table/type";

export interface ITable {
  rows: DataObject<DataRecord>[];
  cols: TPropsTable<DataRecord>["cols"];
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
  getOnCellBlur(rowIndex: number, colIndex: number): (value: any) => void;
  getIsExistOnClickRow(): boolean;
  getOnClickRow(rowIndex: number): () => void;
  getFocusedCellId(): string | null;
  getFocusedCellIndex(): { rowIndex: number; colIndex: number };
  getFocusedCellValue(): string | number;
  getEditStatus(): {
    type: "string" | "number" | "select";
    isEditing: boolean;
  };
  focusCell(rowIndex: number, colIndex: number): void;
  unfocusCell(): void;
  switchToEditMode(position?: { rowIndex: number; colIndex: number }): void;
  switchToFocusMode(): void;
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
  setUpdateEditorFunction(func: () => void): void;
  initializeCellsDesign(): void;
  updateCellData(index: number, key: string, value: any): void;
  updateCellDesign(rowIndex: number, colIndex: number): void;
  refreshData(data: DataObject<DataRecord>[]): void;
}
