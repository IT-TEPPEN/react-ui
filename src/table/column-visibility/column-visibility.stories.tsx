import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import Table from "../table/base";
import { TTableColumn, TTableCondition } from "../table/type";

type Row = {
  name: string;
  dept: string;
  role: string;
  email: string;
  phone: string;
  age: number;
};

// 氏名 is always shown (disableHide); the others can be hidden from the
// 「表示列」 button next to the search bar.
const cols: TTableColumn<Row>[] = [
  { key: "name", type: "string", label: "氏名", pinned: true, disableHide: true, initialWidth: 140 },
  { key: "dept", type: "string", label: "部署", initialWidth: 120 },
  { key: "role", type: "string", label: "役職", initialWidth: 120 },
  { key: "email", type: "string", label: "メール", initialWidth: 220 },
  { key: "phone", type: "string", label: "電話", initialWidth: 150 },
  { key: "age", type: "number", label: "年齢", initialWidth: 90 },
];

const rows = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  name: `社員 ${i + 1}`,
  dept: ["営業部", "開発部", "総務部"][i % 3],
  role: ["部長", "課長", "主任", "一般"][i % 4],
  email: `user${i + 1}@example.com`,
  phone: `03-0000-${String(1000 + i)}`,
  age: 22 + ((i * 7) % 40),
}));

const meta = {
  title: "Table/ColumnSelector",
  component: Table,
  parameters: { layout: "padded" },
} as Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cols: cols as never,
    rows: rows as never,
    columnSelector: true,
    maxWidth: "720px",
    maxHeight: "420px",
    initialCondition: { hiddenColumns: ["phone"] },
  },
};

// The hidden columns are reported in onConditionChange, so they can be saved
// and passed back as initialCondition.hiddenColumns.
function WithSavedView() {
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <div>
      <p style={{ marginBottom: 8 }}>
        hiddenColumns: <code>{JSON.stringify(hidden)}</code>
      </p>
      <Table
        cols={cols}
        rows={rows}
        columnSelector
        maxWidth="720px"
        maxHeight="360px"
        onConditionChange={(condition: TTableCondition) =>
          setHidden(condition.hiddenColumns)
        }
      />
    </div>
  );
}

export const ReportsHiddenColumns: Story = {
  args: { cols: [], rows: [] },
  render: () => <WithSavedView />,
};
