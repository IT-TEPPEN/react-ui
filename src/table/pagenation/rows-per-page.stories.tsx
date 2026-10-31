import type { Meta, StoryObj } from "@storybook/react-vite";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = { name: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "氏名" },
  { key: "age", type: "number", label: "年齢" },
];
const rows = Array.from({ length: 120 }, (_, i) => ({
  id: String(i + 1),
  name: `社員 ${i + 1}`,
  age: 22 + ((i * 7) % 40),
}));

const meta = {
  title: "Table/RowsPerPage",
  component: Table,
  parameters: { layout: "padded" },
} as Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// The user picks 10, 25, 50 or all rows per page.
export const Default: Story = {
  args: {
    cols: cols as never,
    rows: rows as never,
    rowCountPerPageOptions: [10, 25, 50, "all"],
    initialCondition: { pagination: { rowCountPerPage: 10 } },
  },
};
