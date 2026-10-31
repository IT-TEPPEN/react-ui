import type { Meta, StoryObj } from "@storybook/react-vite";
import Table from "./base";
import { TTableColumn } from "./type";

type Row = { name: string; dept: string; age: number };

const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "氏名", editable: true, onCellBlur: (_k, _v, _r, done) => done() },
  {
    key: "dept",
    type: "select",
    label: "部署",
    options: [
      { value: "sales", label: "営業部" },
      { value: "dev", label: "開発部" },
    ],
  },
  { key: "age", type: "number", label: "年齢" },
];
const rows = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: `社員 ${i + 1}`,
  dept: i % 2 ? "sales" : "dev",
  age: 22 + ((i * 7) % 40),
}));

// The --teppen-table-* variables can be set on any ancestor (e.g. :root in a
// stylesheet) or, as here, on the table through style / className.
const brand = {
  "--teppen-table-header-bg": "#123a4f",
  "--teppen-table-header-text": "#e6f1f5",
  "--teppen-table-border": "#c9d6dd",
  "--teppen-table-accent": "#0b8a6e",
  "--teppen-table-row-hover": "rgb(11 138 110 / 0.08)",
  "--teppen-table-selection-border": "#0b8a6e",
  "--teppen-table-selection-bg": "rgb(11 138 110 / 0.12)",
  "--teppen-table-search-border": "#123a4f",
  "--teppen-table-sort-icon": "#e6f1f5",
  "--teppen-table-radius": "10px",
} as React.CSSProperties;

const meta = {
  title: "Table/Theming",
  component: Table,
  parameters: { layout: "padded" },
} as Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { cols: cols as never, rows: rows as never },
};

export const CustomColors: Story = {
  args: { cols: cols as never, rows: rows as never, style: brand },
};
