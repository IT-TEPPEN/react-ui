export interface ITableIdGenerator {
  getTableId(): string;
  getTableColId(args: { columnIndex: number }): string;
  getTableCellId(args: { rowIndex: number; columnIndex: number }): string;
  getEditorId(): string;
  extractCellIndexFromId(id: string): [number, number];
}
