import type { Meta, StoryObj } from "@storybook/react-vite";
import Table from "../table/base";
import { TTableColumn } from "../table/type";

type Row = Record<string, string | number>;

const months = Array.from({ length: 12 }, (_, i) => `m${i + 1}`);

// 氏名 and 部署 stay at the left edge while the monthly columns scroll.
const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "氏名", pinned: true, initialWidth: 140 },
  { key: "dept", type: "string", label: "部署", pinned: true, initialWidth: 110 },
  ...months.map(
    (m, i): TTableColumn<Row> => ({
      key: m,
      type: "number",
      label: `${i + 1}月`,
      initialWidth: 110,
      editable: true,
      onCellBlur: (_k, _v, _r, done) => done(),
    })
  ),
];

const rows = Array.from({ length: 20 }, (_, r) => ({
  id: String(r + 1),
  name: `社員 ${r + 1}`,
  dept: ["営業部", "開発部", "総務部"][r % 3],
  ...Object.fromEntries(months.map((m, i) => [m, ((r + 3) * (i + 7) * 37) % 500])),
}));

const meta = {
  title: "Table/PinnedColumns",
  component: Table,
  parameters: { layout: "padded" },
} as Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cols: cols as never,
    rows: rows as never,
    maxWidth: "900px",
    maxHeight: "420px",
    checkbox: { checked: () => false, onChecked: () => {}, onUnchecked: () => {} },
  },
};
