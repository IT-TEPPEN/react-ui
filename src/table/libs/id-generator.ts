export const IdGenerator = {
  getTableCellId: (rowIndex: number, columnIndex: number) =>
    `table-cell-${rowIndex}-${columnIndex}`,
  getCellIndex: (id: string) => {
    const [_t, _c, rowIndex, columnIndex] = id.split("-");
    return [Number(rowIndex), Number(columnIndex)];
  },
  getTableColId: (columnIndex: number) => `table-col-${columnIndex}`,
};
