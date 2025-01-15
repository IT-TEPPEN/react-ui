import { ITableIdGenerator } from "./interface";

export class IdGenerator implements ITableIdGenerator {
  constructor(private additionalId?: string) {}

  getTableId(): string {
    return `ReactUI:Table${this.additionalId ? `:${this.additionalId}` : ""}`;
  }
  getTableColId(args: { columnIndex: number }): string {
    return `${this.getTableId()}:Column-${args.columnIndex}`;
  }
  getTableCellId(args: { rowIndex: number; columnIndex: number }): string {
    return `${this.getTableId()}:Cell-${args.rowIndex}-${args.columnIndex}`;
  }
  getEditorId(): string {
    return `${this.getTableId()}:Editor`;
  }
  extractCellIndexFromId(id: string): [number, number] {
    const arr = id.split("-");
    const rowIndex = arr[arr.length - 2];
    const columnIndex = arr[arr.length - 1];
    return [Number(rowIndex), Number(columnIndex)];
  }
}
