export const IdGenerator = {
  getTableCellId: (rowIndex: number, columnIndex: number) =>
    `table-cell-${rowIndex}-${columnIndex}`,
  getTableColId: (columnIndex: number) => `table-col-${columnIndex}`,
};
